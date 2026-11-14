from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import os
import urllib.request
import random
import base64
import models

# --- НАСТРОЙКИ БАЗЫ ДАННЫХ ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./vybe.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)

# --- НАСТРОЙКИ БЕЗОПАСНОСТИ (JWT) ---
SECRET_KEY = "super_secret_key_vybe_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ИНИЦИАЛИЗАЦИЯ MEDIAPIPE ---
MODEL_PATH = "face_landmarker.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
if not os.path.exists(MODEL_PATH):
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(base_options=base_options, num_faces=1)
detector = vision.FaceLandmarker.create_from_options(options)

# --- СХЕМЫ ДАННЫХ ---
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    age: int | None = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    balance: float
    price: float
    photo_url: str | None
    age: int | None
    bio: str | None
    interests: str | None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    bio: str | None = None
    interests: str | None = None
    photo_url: str | None = None

class RequestCreate(BaseModel):
    receiver_id: int

class RequestResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime
    sender: UserResponse

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    receiver_id: int
    text: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    text: str
    is_read: bool # <-- Добавили
    created_at: datetime

    class Config:
        from_attributes = True

# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def check_expired_requests(db: Session):
    expiration_time = datetime.utcnow() - timedelta(hours=12)
    expired_requests = db.query(models.Request).filter(
        models.Request.status == "pending",
        models.Request.created_at < expiration_time
    ).all()

    for req in expired_requests:
        sender = db.query(models.User).filter(models.User.id == req.sender_id).first()
        if sender:
            sender.balance += 500
        req.status = "expired"
    
    if expired_requests:
        db.commit()

# --- ЭНДПОИНТЫ ---

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password, 
        name=user.name,
        age=user.age,
        photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@app.put("/update-profile", response_model=UserResponse)
def update_profile(data: ProfileUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    reward = 0
    if data.bio and not current_user.bio:
        current_user.bio = data.bio
        reward += 500
    if data.interests and not current_user.interests:
        current_user.interests = data.interests
        reward += 500
    if data.photo_url and data.photo_url != current_user.photo_url:
        current_user.photo_url = data.photo_url

    current_user.balance += reward
    db.commit()
    db.refresh(current_user)
    return current_user

# --- ЕЖЕДНЕВНЫЙ БОНУС ---
@app.post("/daily-bonus")
def claim_daily_bonus(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    
    # Если бонус уже брали и прошло меньше 24 часов
    if current_user.last_bonus_claim and (now - current_user.last_bonus_claim) < timedelta(hours=24):
        time_left = timedelta(hours=24) - (now - current_user.last_bonus_claim)
        hours = time_left.seconds // 3600
        minutes = (time_left.seconds % 3600) // 60
        raise HTTPException(status_code=400, detail=f"Бонус доступен через {hours} ч {minutes} мин")

    current_user.balance += 500
    current_user.last_bonus_claim = now
    db.commit()
    return {"message": "Вы получили 500 VYBE!", "new_balance": current_user.balance}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Не удалось прочитать изображение"}

    rgb_image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
    detection_result = detector.detect(mp_image)

    base_price = 500
    bonus = 0
    details = []

    if detection_result.face_landmarks:
        details.append("Лицо распознано (+100)")
        bonus += 100

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()

        if brightness > 60 and brightness < 200:
            bonus += 150
            details.append("Хороший свет (+150)")
        
        if sharpness > 100:
            bonus += 200
            details.append("Четкое фото (+200)")
            
        landmarks = detection_result.face_landmarks[0]
        upper_lip = landmarks[13]
        lower_lip = landmarks[14]
        lip_distance = abs(upper_lip.y - lower_lip.y)
        
        if lip_distance > 0.015:
            bonus += 250
            details.append("Улыбка и позитив (+250)")

        h, w, _ = img.shape
        for landmark in landmarks:
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            cv2.circle(img, (x, y), 1, (180, 105, 255), -1)
    else:
        details.append("Лицо не найдено (База 500)")

    if random.random() > 0.5:
        bonus += 100
        details.append("Креативный стиль (+100)")

    total_price = base_price + bonus
    current_user.price = total_price
    db.commit()

    _, buffer = cv2.imencode('.jpg', img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    processed_image_url = f"data:image/jpeg;base64,{img_base64}"

    return {
        "price": total_price,
        "base": base_price,
        "bonus": bonus,
        "details": details,
        "processed_image": processed_image_url
    }

@app.post("/request")
def send_request(req: RequestCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_expired_requests(db)
    
    if current_user.balance < 500:
        raise HTTPException(status_code=400, detail="Недостаточно VYBE (нужно 500)")
    
    existing = db.query(models.Request).filter(
        models.Request.sender_id == current_user.id,
        models.Request.receiver_id == req.receiver_id,
        models.Request.status == "pending"
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Вы уже отправляли запрос этому пользователю. Ожидайте ответа.")

    current_user.balance -= 500
    
    new_request = models.Request(
        sender_id=current_user.id,
        receiver_id=req.receiver_id,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    return {"message": "Запрос отправлен! У вас есть 12 часов."}

@app.get("/incoming-requests", response_model=list[RequestResponse])
def get_incoming_requests(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_expired_requests(db)
    requests = db.query(models.Request).options(joinedload(models.Request.sender)).filter(
        models.Request.receiver_id == current_user.id,
        models.Request.status == "pending"
    ).all()
    return requests

@app.post("/requests/{request_id}/accept")
def accept_request(request_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = db.query(models.Request).filter(models.Request.id == request_id, models.Request.receiver_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Запрос не найден")
    
    req.status = "accepted"
    db.commit()
    return {"message": "Запрос принят! Теперь вы можете общаться."}

@app.post("/requests/{request_id}/reject")
def reject_request(request_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = db.query(models.Request).filter(models.Request.id == request_id, models.Request.receiver_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Запрос не найден")
    
    req.status = "rejected"
    sender = db.query(models.User).filter(models.User.id == req.sender_id).first()
    if sender:
        sender.balance += 500
    db.commit()
    return {"message": "Запрос отклонен. Деньги возвращены отправителю."}

@app.get("/request-status/{user_id}")
def get_request_status(user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = db.query(models.Request).filter(
        or_(
            (models.Request.sender_id == current_user.id) & (models.Request.receiver_id == user_id),
            (models.Request.sender_id == user_id) & (models.Request.receiver_id == current_user.id)
        )
    ).order_by(models.Request.created_at.desc()).first()

    if not req:
        return {"status": "none"}
    return {"status": req.status}

@app.get("/chats", response_model=list[UserResponse])
def get_chats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    accepted_requests = db.query(models.Request).filter(
        or_(
            (models.Request.sender_id == current_user.id),
            (models.Request.receiver_id == current_user.id)
        ),
        models.Request.status == "accepted"
    ).all()

    chat_users = []
    for req in accepted_requests:
        other_id = req.receiver_id if req.sender_id == current_user.id else req.sender_id
        user = db.query(models.User).filter(models.User.id == other_id).first()
        if user and user not in chat_users:
            chat_users.append(user)
    
    return chat_users

@app.post("/messages", response_model=MessageResponse)
def send_message(msg: MessageCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    has_request = db.query(models.Request).filter(
        or_(
            (models.Request.sender_id == current_user.id) & (models.Request.receiver_id == msg.receiver_id),
            (models.Request.sender_id == msg.receiver_id) & (models.Request.receiver_id == current_user.id)
        ),
        models.Request.status != "rejected"
    ).first()
    
    if not has_request:
        raise HTTPException(status_code=403, detail="Сначала отправьте или примите запрос")

    new_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=msg.receiver_id,
        text=msg.text,
        is_read=False
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@app.get("/messages/{user_id}", response_model=list[MessageResponse])
def get_messages(user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Помечаем сообщения от собеседника как прочитанные
    db.query(models.Message).filter(
        models.Message.sender_id == user_id,
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(models.Message).filter(
        or_(
            (models.Message.sender_id == current_user.id) & (models.Message.receiver_id == user_id),
            (models.Message.sender_id == user_id) & (models.Message.receiver_id == current_user.id)
        )
    ).order_by(models.Message.created_at.asc()).all()
    return messages

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)