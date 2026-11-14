import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Home = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuth(true);
      fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuth(false);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="glow-circle circle-1"></div>
      <div className="glow-circle circle-2"></div>

      <div className="glass-card">
        <nav className="navbar">
          <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>VYBE ♡</div>
          <div className="nav-links">
            <span onClick={() => navigate('/')}>Главная</span>
            <span onClick={() => navigate('/feed')}>Лента</span>
            {isAuth && <span onClick={() => navigate('/chats')}>Сообщения</span>}
            <span onClick={() => navigate('/about')}>О нас</span>
            
            {isAuth ? (
              <>
                <span onClick={() => navigate('/profile')} style={{color: '#ff69b4'}}>Мой профиль</span>
                <button className="btn-outline" onClick={handleLogout} style={{borderColor: '#ff4444', color: '#ff4444'}}>Выйти</button>
              </>
            ) : (
              <button className="btn-outline" onClick={() => navigate('/auth')}>Войти</button>
            )}
          </div>
        </nav>

        {isAuth && user ? (
          <div className="hero-section">
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255,105,180,0.15), rgba(255,20,147,0.05))', 
              border: '1px solid rgba(255,105,180,0.4)', 
              borderRadius: '24px', 
              padding: '40px', 
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(255,105,180,0.2)',
              marginBottom: '30px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div className="glow-circle circle-1" style={{ opacity: 0.5 }}></div>
              
              <p style={{ color: '#ffb6c1', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '10px' }}>
                Твоя текущая ценность
              </p>
              <h1 className="hero-title" style={{ fontSize: '4.5rem', margin: 0, textShadow: '0 0 30px rgba(255,105,180,0.8)' }}>
                {user.price} <span style={{ fontSize: '2rem', color: '#fff' }}>VYBE</span>
              </h1>
              <p style={{ color: '#aaa', marginTop: '15px', fontSize: '1rem' }}>
                Привет, {user.name}! Готов обновить свою цену с помощью ИИ?
              </p>
              
              <button className="btn-primary" onClick={() => navigate('/analyze')} style={{ margin: '20px auto 0', padding: '15px 50px', fontSize: '1.1rem', boxShadow: '0 0 30px rgba(255,20,147,0.6)' }}>
                Узнать цену заново 🚀
              </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-outline" onClick={() => navigate('/feed')} style={{ padding: '15px 40px', borderRadius: '30px', fontSize: '1rem' }}>
                Перейти в ленту
              </button>
              <button className="btn-outline" onClick={() => navigate('/profile')} style={{ padding: '15px 40px', borderRadius: '30px', fontSize: '1rem' }}>
                Мой профиль
              </button>
            </div>
          </div>
        ) : (
          <div className="hero-section">
            <h1 className="hero-title">Узнай свою цену.<br/>Найди свою пару.</h1>
            <p className="hero-subtitle">
              Дейтинг приложение нового поколения на стыке AI, 
              компьютерного зрения и игровой экономики.
            </p>
            <button className="btn-primary" onClick={() => navigate('/auth')}>
              Начать <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;