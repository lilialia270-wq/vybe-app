import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const [avatarStyle, setAvatarStyle] = useState('avataaars');
  const [avatarSeed, setAvatarSeed] = useState('');

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setBio(data.bio || '');
        setInterests(data.interests || '');
        setAvatarSeed(data.name);
      })
      .catch(() => navigate('/auth'));
  };

  useEffect(() => { fetchProfile(); }, [navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const newAvatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=ffdfbf,ffd5dc,b6e3f4,c0aede,d1d4f9`;

    try {
      const res = await fetch(`${API_URL}/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bio, interests, photo_url: newAvatarUrl })
      });

      const data = await res.json();
      setUser(data);
      setIsEditing(false);
      
      if (data.balance > user.balance) {
        setMessage(`🎉 Профиль обновлен! Вы получили +${data.balance - user.balance} VYBE`);
      } else {
        setMessage('Профиль обновлен!');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert("Ошибка при сохранении");
    }
  };

  const handleDailyBonus = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/daily-bonus`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, balance: data.new_balance }));
        setMessage(`💎 ${data.message}`);
      } else {
        setMessage(`⏳ ${data.detail}`);
      }
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage("Ошибка при получении бонуса");
    }
  };

  const randomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  if (!user) return <div className="app-container"><h2 style={{color: 'white', zIndex: 10}}>Загрузка...</h2></div>;

  return (
    <div className="app-container" style={{ paddingTop: '40px', overflowY: 'auto', alignItems: 'flex-start' }}>
      <div className="glow-circle circle-1"></div>
      <div className="glow-circle circle-2"></div>
      
      <div className="glass-card" style={{ maxWidth: '700px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="btn-outline" onClick={() => navigate('/')} style={{marginBottom: '20px', width: 'fit-content'}}>
          ← На главную
        </button>

        {message && <div style={{ color: '#69ffb4', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', background: 'rgba(105,255,180,0.1)', padding: '10px', borderRadius: '10px' }}>{message}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', background: 'linear-gradient(135deg, rgba(255,105,180,0.1), transparent)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,105,180,0.2)' }}>
          <img src={user.photo_url} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #ff69b4', background: '#fff', boxShadow: '0 0 20px rgba(255,105,180,0.5)' }} />
          <div>
            <h2 className="hero-title" style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{user.name}, {user.age || '??'}</h2>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <span style={{ background: 'rgba(255,105,180,0.2)', color: '#ff69b4', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid #ff69b4' }}>
                Цена: {user.price} VYBE
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '5px 15px', borderRadius: '20px' }}>
                Баланс: {user.balance} VYBE
              </span>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleDailyBonus} style={{ width: '100%', marginBottom: '20px', background: 'linear-gradient(135deg, #ffb6c1, #ff69b4)' }}>
          🎁 Получить ежедневный бонус (500 VYBE)
        </button>

        {!isEditing ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ color: '#ffb6c1', marginBottom: '10px' }}>О себе</h3>
                <p style={{ color: '#ccc', lineHeight: 1.5 }}>{user.bio || 'Пользователь пока ничего не рассказал о себе.'}</p>
                {!user.bio && <span style={{ color: '#69ffb4', fontSize: '0.8rem', display: 'block', marginTop: '10px' }}>+500 VYBE за заполнение!</span>}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ color: '#ffb6c1', marginBottom: '10px' }}>Интересы</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.interests ? (
                    user.interests.split(',').map((interest, i) => (
                      <span key={i} style={{ background: 'rgba(255,105,180,0.2)', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', color: '#ffb6c1' }}>
                        {interest.trim()}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: '#ccc' }}>Интересы не указаны.</p>
                  )}
                </div>
                {!user.interests && <span style={{ color: '#69ffb4', fontSize: '0.8rem', display: 'block', marginTop: '10px' }}>+500 VYBE за заполнение!</span>}
              </div>
            </div>

            <button className="btn-primary" onClick={() => setIsEditing(true)} style={{ width: '100%', marginBottom: '15px' }}>
              Редактировать профиль
            </button>
          </>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px' }}>
            <h3 style={{ color: '#ffb6c1', marginBottom: '15px' }}>Настройка аватара</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <img src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=ffdfbf,ffd5dc,b6e3f4,c0aede,d1d4f9`} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed #ff69b4', background: '#fff' }} />
              <button className="btn-outline" onClick={randomizeAvatar} style={{ flex: 1 }}>🎲 Случайный аватар</button>
            </div>

            <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Стиль</label>
            <select value={avatarStyle} onChange={(e) => setAvatarStyle(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', marginTop: '5px', marginBottom: '20px' }}>
              <option value="avataaars">Мультяшный</option>
              <option value="bottts">Робот</option>
              <option value="adventurer">Приключенец</option>
              <option value="micah">Минимализм</option>
            </select>

            <h3 style={{ color: '#ffb6c1', marginBottom: '15px' }}>О себе</h3>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="3" placeholder="Расскажите о себе..." style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', resize: 'none', marginTop: '5px', marginBottom: '15px' }} />

            <h3 style={{ color: '#ffb6c1', marginBottom: '15px' }}>Интересы</h3>
            <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="музыка, спорт, кино..." style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', marginTop: '5px', marginBottom: '20px' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>Сохранить</button>
              <button className="btn-outline" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Отмена</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-primary" onClick={() => navigate('/analyze')} style={{ flex: 1, margin: 0 }}>Обновить цену</button>
          <button className="btn-outline" onClick={() => navigate('/incoming')} style={{ flex: 1 }}>Входящие запросы</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;