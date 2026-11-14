import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const fetchChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    try {
      const userRes = await fetch(`${API_URL}/users/${id}`);
      if (!userRes.ok) throw new Error("Пользователь не найден");
      const userData = await userRes.json();
      setOtherUser(userData);

      const msgRes = await fetch(`${API_URL}/messages/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (msgRes.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }
      
      const msgData = await msgRes.json();
      setMessages(msgData);
      setError(''); 
    } catch (err) {
      setError(err.message || 'Ошибка загрузки чата');
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: parseInt(id), text: newMessage })
      });

      if (res.ok) {
        setNewMessage('');
        fetchChat();
      } else {
        const data = await res.json();
        setError(data.detail || 'Ошибка отправки');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  if (!otherUser) return <div className="app-container"><h2 style={{color: 'white', zIndex: 10}}>Загрузка...</h2></div>;

  return (
    <div className="app-container" style={{ alignItems: 'flex-start', paddingTop: '40px' }}>
      <div className="glass-card" style={{ height: '80vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '15px' }}>
          <button className="btn-outline" onClick={() => navigate('/chats')} style={{ padding: '5px 15px' }}>← К чатам</button>
          <img src={otherUser.photo_url} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #ff69b4', background: '#fff' }} />
          <div>
            <h3 style={{ margin: 0 }}>{otherUser.name}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#69ffb4' }}>В сети</p>
          </div>
        </div>

        {error && <div style={{ color: '#ff69b4', textAlign: 'center', marginBottom: '10px', background: 'rgba(255,105,180,0.1)', padding: '10px', borderRadius: '10px' }}>{error}</div>}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>Начните общение первым!</p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id !== parseInt(id); 
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '70%', padding: '10px 15px', borderRadius: '15px', 
                    background: isMine ? 'linear-gradient(135deg, #ff69b4, #ff1493)' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderBottomRightRadius: isMine ? '2px' : '15px',
                    borderBottomLeftRadius: !isMine ? '2px' : '15px',
                    position: 'relative',
                    paddingBottom: isMine ? '20px' : '10px'
                  }}>
                    {msg.text}
                    {isMine && (
                      <span style={{ position: 'absolute', bottom: '5px', right: '10px', fontSize: '0.7rem', color: msg.is_read ? '#69ffb4' : '#ccc' }}>
                        {msg.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Напишите сообщение..." style={{ flex: 1, padding: '15px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none' }} />
          <button type="submit" className="btn-primary" style={{ margin: 0, padding: '0 25px' }}>➤</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;