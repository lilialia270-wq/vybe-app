import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Incoming = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    try {
      const res = await fetch(`${API_URL}/incoming-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }

      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setMessage('Не удалось загрузить запросы.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (requestId, action) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      setRequests(prev => prev.filter(req => req.id !== requestId));
      setMessage(data.message || 'Готово');
      setTimeout(() => setMessage(''), 4000);

    } catch (err) {
      setMessage("Ошибка при выполнении действия");
    }
  };

  if (loading) return <div className="app-container"><h2 style={{color: 'white', zIndex: 10}}>Загрузка...</h2></div>;

  return (
    <div className="app-container" style={{ alignItems: 'flex-start', paddingTop: '40px', overflowY: 'auto' }}>
      <div className="glass-card" style={{ height: 'auto', minHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className="hero-title" style={{ fontSize: '2rem', margin: 0 }}>Входящие запросы</h2>
          <button className="btn-outline" onClick={() => navigate('/')}>На главную</button>
        </div>

        {message && <div style={{ color: '#69ffb4', marginBottom: '20px', textAlign: 'center', padding: '10px', background: 'rgba(105,255,180,0.1)', borderRadius: '10px' }}>{message}</div>}

        {requests.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>У вас пока нет новых входящих запросов.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {requests.map(req => (
              <div key={req.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,105,180,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <img src={req.sender.photo_url} alt={req.sender.name} style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #ff69b4', background: '#fff' }} />
                  <div>
                    <h3 style={{ margin: 0 }}>{req.sender.name}, {req.sender.age || '??'}</h3>
                    <p style={{ color: '#ff69b4', margin: 0, fontSize: '0.9rem' }}>Цена: {req.sender.price} VYBE</p>
                  </div>
                </div>
                
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>
                  {req.sender.bio || 'Пользователь пока не рассказал о себе.'}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={() => handleAction(req.id, 'accept')} style={{ flex: 1, padding: '10px', fontSize: '0.9rem', margin: 0, background: 'linear-gradient(135deg, #69ffb4, #00cc66)' }}>
                    Принять
                  </button>
                  <button className="btn-outline" onClick={() => handleAction(req.id, 'reject')} style={{ flex: 1, padding: '10px', fontSize: '0.9rem', borderColor: '#ff4444', color: '#ff4444' }}>
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Incoming;