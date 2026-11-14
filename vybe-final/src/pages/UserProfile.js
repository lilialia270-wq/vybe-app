import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [requestStatus, setRequestStatus] = useState('loading'); 
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    fetch(`${API_URL}/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data));

    fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMyProfile(data));

    fetch(`${API_URL}/request-status/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRequestStatus(data.status));
    
  }, [id, navigate]);

  const handleSendRequest = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: parseInt(id) })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('✅ Запрос отправлен! У вас есть 12 часов.');
        setRequestStatus('pending');
        setMyProfile(prev => ({ ...prev, balance: prev.balance - 500 }));
      } else {
        setMessage(`❌ ${data.detail}`);
      }
    } catch (err) {
      setMessage('❌ Ошибка при отправке');
    }
  };

  if (!user) return <div className="app-container"><h2 style={{color: 'white', zIndex: 10}}>Загрузка...</h2></div>;

  return (
    <div className="app-container">
      <div className="glow-circle circle-1"></div>
      <div className="glow-circle circle-2"></div>
      
      <div className="glass-card" style={{ maxWidth: '600px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="btn-outline" onClick={() => navigate('/feed')} style={{marginBottom: '20px', width: 'fit-content'}}>
          ← Назад в ленту
        </button>

        {message && <div style={{ padding: '10px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', background: message.includes('✅') ? 'rgba(105,255,180,0.2)' : 'rgba(255,105,180,0.2)', color: message.includes('✅') ? '#69ffb4' : '#ff69b4' }}>{message}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <img src={user.photo_url} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #ff69b4', background: '#fff' }} />
          <div>
            <h2 className="hero-title" style={{ fontSize: '2rem', margin: 0 }}>{user.name}, {user.age || '??'}</h2>
            <p style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '1.2rem', margin: '5px 0' }}>Цена: {user.price} VYBE</p>
            <p style={{ color: '#aaa' }}>Ваш баланс: {myProfile?.balance || 0} VYBE</p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
          <h3 style={{ color: '#ffb6c1', marginBottom: '10px' }}>О себе</h3>
          <p style={{ color: '#ccc' }}>{user.bio || 'Пользователь пока ничего не рассказал о себе.'}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
          <h3 style={{ color: '#ffb6c1', marginBottom: '10px' }}>Интересы</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {user.interests ? user.interests.split(',').map((interest, i) => (
              <span key={i} style={{ background: 'rgba(255,105,180,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', color: '#ffb6c1' }}>
                {interest.trim()}
              </span>
            )) : <p style={{ color: '#ccc' }}>Интересы не указаны.</p>}
          </div>
        </div>

        {requestStatus === 'accepted' ? (
          <button className="btn-primary" onClick={() => navigate(`/chat/${user.id}`)} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #69ffb4, #00cc66)' }}>
            Написать сообщение 💬
          </button>
        ) : requestStatus === 'pending' ? (
          <button className="btn-outline" disabled style={{ width: '100%', padding: '15px', borderColor: '#ffb6c1', color: '#ffb6c1', cursor: 'not-allowed' }}>
            Запрос отправлен ⏳ (ожидает ответа)
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSendRequest} style={{ width: '100%', padding: '15px' }}>
            Отправить запрос (500 VYBE)
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;