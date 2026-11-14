import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="app-container" 
      style={{ 
        paddingTop: '40px', 
        paddingBottom: '40px',
        alignItems: 'flex-start', 
        height: '100vh', 
        overflowY: 'auto',
        display: 'block' // Позволяет контенту растягиваться
      }}
    >
      <div className="glow-circle circle-1"></div>
      <div className="glow-circle circle-2"></div>
      
      <div 
        className="glass-card" 
        style={{ 
          maxWidth: '800px', 
          height: 'auto', // Убираем фиксированную высоту
          minHeight: '80vh', 
          padding: '40px',
          margin: '0 auto' // Центрируем по горизонтали
        }}
      >
        <button className="btn-outline" onClick={() => navigate('/')} style={{marginBottom: '30px', width: 'fit-content'}}>
          ← На главную
        </button>

        <h1 className="hero-title" style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: '10px' }}>
          О проекте VYBE
        </h1>
        <p style={{ textAlign: 'center', color: '#ffb6c1', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '40px' }}>
          Дейтинг нового поколения
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Блок Миссии */}
          <div style={{ background: 'rgba(255,105,180,0.05)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,105,180,0.2)' }}>
            <h2 style={{ color: '#ff69b4', marginBottom: '15px', fontSize: '1.8rem' }}>Наша миссия</h2>
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1.1rem' }}>
              Мы устали от бесконечных свайпов и поверхностных знакомств. VYBE — это попытка переосмыслить дейтинг, 
              добавив в него элементы игры и технологий будущего. Мы верим, что знакомство должно начинаться 
              с интереса и эмоций, а не просто с красивой картинки.
            </p>
          </div>

          {/* Блок Технологий */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#ffb6c1', marginBottom: '15px', fontSize: '1.8rem' }}>Как это работает?</h2>
            <ul style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1.05rem', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#fff' }}>Компьютерное зрение (AI):</strong> Мы используем библиотеку MediaPipe, 
                чтобы найти лицо на фото, определить эмоции (улыбку) и качество освещения.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#fff' }}>Игровая экономика:</strong> За активность (заполнение профиля, ежедневный вход) 
                вы получаете внутреннюю валюту — VYBE. Отправка запроса на знакомство стоит 500 VYBE.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#fff' }}>Честность:</strong> Если человек не ответил на ваш запрос в течение 12 часов, 
                валюта автоматически возвращается на баланс.
              </li>
              <li>
                <strong style={{ color: '#fff' }}>Этичный AI:</strong> Мы оцениваем стиль и эмоции, а не генетические 
                или расовые признаки. "Цена" — это лишь игровая механика.
              </li>
            </ul>
          </div>

          {/* Блок Стект-технологий */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>Frontend</h3>
              <p style={{ color: '#aaa' }}>React, CSS3, React Router</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>Backend & AI</h3>
              <p style={{ color: '#aaa' }}>Python, FastAPI, SQLite, MediaPipe</p>
            </div>
          </div>

        </div>

        <p style={{ textAlign: 'center', color: '#666', marginTop: '50px', fontSize: '0.9rem' }}>
          Учебный проект. Создано с любовью к технологиям и дизайну. ♡
        </p>
      </div>
    </div>
  );
};

export default About;