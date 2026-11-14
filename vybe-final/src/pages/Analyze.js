import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Analyze = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Сначала войдите в аккаунт, чтобы узнать цену!");
      navigate('/auth');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'photo.jpg');

      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) {
        alert("Сессия истекла или вы не авторизованы. Пожалуйста, войдите заново.");
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }

      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setResult({
          price: data.price,
          base: data.base,
          bonus: data.bonus,
          details: data.details,
          processed_image: data.processed_image
        });
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка: AI-сервер не отвечает.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="glow-circle circle-1"></div>
      <div className="glow-circle circle-2"></div>
      
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/')} style={{marginBottom: '20px', width: 'fit-content'}}>
            ← На главную
          </button>
        </div>

        <h2 className="hero-title" style={{fontSize: '2.5rem'}}>Анализ твоего VYBE</h2>
        
        {!image ? (
          <div className="upload-box" style={{ border: '2px dashed #ff69b4', padding: '40px', borderRadius: '15px', textAlign: 'center', marginTop: '20px' }}>
            <p style={{marginBottom: '20px', color: '#ccc'}}>Загрузи фото, чтобы ИИ оценил твой стиль и эмоции</p>
            <input type="file" accept="image/*" onChange={handleImageUpload} id="file-upload" style={{display: 'none'}}/>
            <label htmlFor="file-upload" className="btn-primary upload-label" style={{cursor: 'pointer', display: 'inline-block', marginTop: '10px'}}>
              Выбрать фото
            </label>
          </div>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={result?.processed_image || image} 
              alt="Upload" 
              style={{ maxHeight: '250px', borderRadius: '15px', border: '2px solid #ff69b4', boxShadow: '0 0 20px rgba(255, 105, 180, 0.3)' }} 
            />
            
            {!result && !loading && (
              <button className="btn-primary" onClick={handleAnalyze} style={{ margin: '30px auto' }}>
                Узнать цену
              </button>
            )}

            {loading && (
              <div style={{ marginTop: '30px', animation: 'fadeInUp 0.5s ease-out' }}>
                <div className="heart-beat">♡</div>
                <h3 style={{ color: '#ffb6c1', marginTop: '15px', fontWeight: '400' }}>
                  Искусственный интеллект сканирует твой вайб...
                </h3>
              </div>
            )}

            {result && (
              <div className="result-card" style={{ marginTop: '20px', background: 'rgba(255, 105, 180, 0.05)', padding: '30px', borderRadius: '20px', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1px', marginBottom: '10px' }}>
                  ТВОЯ ЦЕНА
                </h3>
                
                <div className="price-number" style={{ fontSize: '4.5rem', color: '#ff69b4', fontWeight: 'bold', margin: '10px 0' }}>
                  {result.price}
                  <span style={{ fontSize: '1.5rem', marginLeft: '10px', color: '#fff' }}>VYBE</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '10px' }}>База: {result.base}</span>
                  <span style={{ background: 'rgba(255,105,180,0.2)', color: '#ffb6c1', padding: '5px 10px', borderRadius: '10px' }}>Бонусы: +{result.bonus}</span>
                </div>

                <div style={{ marginTop: '20px' }}>
                  {result.details.map((item, index) => (
                    <div key={index} className="bonus-badge">
                      ✨ {item}
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
                  <button className="btn-outline" onClick={() => { setImage(null); setResult(null); }}>
                    Загрузить другое фото
                  </button>
                  
                  <button className="btn-primary" onClick={() => navigate('/feed')} style={{ margin: 0 }}>
                    Перейти в ленту →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyze;