import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Incoming from './pages/Incoming';
import Chat from './pages/Chat';
import ChatsList from './pages/ChatsList';
import About from './pages/About'; // <-- Импортируем
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} /> {/* <-- Добавляем маршрут */}
      <Route path="/analyze" element={<Analyze />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/user/:id" element={<UserProfile />} />
      <Route path="/incoming" element={<Incoming />} />
      <Route path="/chat/:id" element={<Chat />} />
      <Route path="/chats" element={<ChatsList />} />
    </Routes>
  );
}

export default App;