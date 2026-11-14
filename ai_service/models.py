from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    balance = Column(Float, default=1000.0)
    price = Column(Float, default=500.0)
    photo_url = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    bio = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    last_bonus_claim = Column(DateTime, nullable=True) # <-- Для ежедневного бонуса
    
    sent_requests = relationship("Request", foreign_keys="Request.sender_id", back_populates="sender")
    received_requests = relationship("Request", foreign_keys="Request.receiver_id", back_populates="receiver")

class Request(Base):
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    text = Column(String)
    is_read = Column(Boolean, default=False) # <-- Статус прочтения
    created_at = Column(DateTime, default=datetime.utcnow)