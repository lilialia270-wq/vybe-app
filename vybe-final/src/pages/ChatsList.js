import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const ChatsList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    fetch(`${API_URL}/chats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setChats(data);
        setLoading(false);
      })
      .catch(() => {
        navigate('/auth');
      });
  }, [navigate]);

  if (loading) return <div className="app-container"><h2 style={{color: 'white', zIndex: 10}}>Загрузка...</h2></div>;

  return (
    <div className="app-container" style={{ alignItems: 'flex-start', paddingTop: '40px' }}>
      <div className="glass-card" style={{ maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="hero-title" style={{ fontSize: '2rem', margin: 0 }}>Сообщения</h2>
          <button className="btn-outline" onClick={() => navigate('/')}>На главную</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
              У вас пока нет активных чатов. Отправляйте запросы в ленте, и когда их примут — здесь появится чат!
            </p>
          ) : (
            chats.map(user => (
              <div 
                key={user.id} 
                onClick={() => navigate(`/chat/${user.id}`)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '15px', 
                  padding: '15px', borderRadius: '15px', 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: '10px', cursor: 'pointer',
                  transition: '0.3s',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,105,180,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,105,180,0.3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'transparent' }}
              >
                <img src={user.photo_url} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #ff69b4', background: '#fff' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>Нажмите, чтобы открыть чат</p>
                </div>
                <span style={{ color: '#ff69b4', fontSize: '1.2rem' }}>→</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatsList;