import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    const fetchData = async () => {
      try {
        const meRes = await fetch(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        setCurrentUser(meData);

        const usersRes = await fetch(`${API_URL}/users`);
        const usersData = await usersRes.json();
        setUsers(usersData.filter(u => u.id !== meData.id));
      } catch (err) {
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div className="app-container"><h2 style={{color: 'white', zIndex: 10}}>Загрузка...</h2></div>;

  return (
    <div className="app-container" style={{ alignItems: 'flex-start', paddingTop: '40px', overflowY: 'auto' }}>
      <div className="glass-card" style={{ height: 'auto', minHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 className="hero-title" style={{ fontSize: '2rem', margin: 0 }}>Лента VYBE</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,105,180,0.2)', padding: '10px 20px', borderRadius: '20px', border: '1px solid #ff69b4' }}>
              Баланс: <strong style={{ color: '#ff69b4' }}>{currentUser?.balance || 0} VYBE</strong>
            </div>
            <button className="btn-outline" onClick={() => navigate('/incoming')}>Входящие</button>
            <button className="btn-outline" onClick={() => navigate('/')}>На главную</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {users.map(user => (
            <div 
              key={user.id} 
              onClick={() => navigate(`/user/${user.id}`)}
              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,105,180,0.2)', cursor: 'pointer', transition: '0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={user.photo_url} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #ff69b4', marginBottom: '15px', background: '#fff' }} />
              <h3 style={{ margin: '0 0 5px 0' }}>{user.name}, {user.age || '??'}</h3>
              <p style={{ color: '#ff69b4', fontWeight: 'bold', margin: '0 0 15px 0' }}>{user.price} VYBE</p>
              <p style={{ color: '#aaa', fontSize: '0.8rem' }}>Нажми, чтобы посмотреть профиль</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;