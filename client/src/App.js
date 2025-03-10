import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatList from './components/ChatList';
import Profile from './components/Profile';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('messengerToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

  useEffect(() => {
    console.log('Token:', token);
    console.log('User ID:', userId);
  }, [token, userId]);

  const handleLogin = (newToken, newUserId) => {
    localStorage.setItem('messengerToken', newToken);
    localStorage.setItem('userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
  };

  const handleLogout = () => {
    localStorage.removeItem('messengerToken');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatList token={token} />} />
        <Route path="/profile" element={<Profile token={token} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
};

export default App;