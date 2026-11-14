import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await fetch(`${API_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });

        if (!res.ok) throw new Error('Неверный email или пароль');
        
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        navigate('/');

      } else {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, age: age ? parseInt(age) : null })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Ошибка регистрации');
        }
        
        const loginData = new URLSearchParams();
        loginData.append('username', email);
        loginData.append('password', password);

        const loginRes = await fetch(`${API_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginData
        });

        if (loginRes.ok) {
          const loginResult = await loginRes.json();
          localStorage.setItem('token', loginResult.access_token);
          navigate('/');
        } else {
          setIsLogin(true);
          setSuccessMsg('Регистрация успешна! Теперь войдите.');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container">
      <div className="glow-circle circle-1"></div>
      <div className="glow-circle circle-2"></div>
      
      <div className="glass-card" style={{ maxWidth: '450px', padding: '40px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 className="hero-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>
          {isLogin ? 'С возвращением' : 'Создать VYBE'}
        </h2>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '0.9rem' }}>
          {isLogin ? 'Войдите, чтобы узнать свою цену' : 'Зарегистрируйтесь и получите 1000 VYBE на старт'}
        </p>

        {error && <div style={{ color: '#ff69b4', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        {successMsg && <div style={{ color: '#69ffb4', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <>
              <input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
              <input type="number" placeholder="Возраст" value={age} onChange={(e) => setAge(e.target.value)} required style={{ padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }} />

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#aaa', textAlign: 'center', fontSize: '0.9rem' }}>
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} style={{ color: '#ff69b4', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? 'Создать' : 'Войти'}
          </span>
        </p>
        
        <button className="btn-outline" onClick={() => navigate('/')} style={{ marginTop: '20px', width: '100%' }}>
          ← На главную
        </button>
      </div>
    </div>
  );
};

export default Auth;