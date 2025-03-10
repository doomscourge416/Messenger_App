import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Home from './components/Home';
import Chat from './components/Chat';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  const [token, setToken] = useState(localStorage.getItem('messengerToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  const navigate = useNavigate();

  // Обработка входа
  const handleLogin = (newToken, newUserId) => {
    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem('messengerToken', newToken);
    localStorage.setItem('userId', newUserId);
  };

  // Обработка выхода
  const handleLogout = async () => {
    try {
      await axios.post(
        '/api/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem('messengerToken');
      localStorage.removeItem('userId');
      setToken(null);
      setUserId(null);

      alert('Вы успешно вышли из системы.');
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error.response?.data || error.message);
      alert('Не удалось выйти из системы.');
    }
  };

  return (
    <div className="App">
      <h1>Мессенджер</h1>

      <Header token={token} setToken={setToken} setIsRegistering={setIsRegistering} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:chatId" element={<Chat token={token} />} />
        <Route path="/profile" element={<Profile token={token} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

      {!token ? (
        isRegistering ? (
          <Register onBack={() => setIsRegistering(false)} />
        ) : isForgotPassword ? (
          <ForgotPassword onBack={() => setIsForgotPassword(false)} />
        ) : isResetPassword ? (
          <ResetPassword onBack={() => setIsResetPassword(false)} />
        ) : (
          <Login
            onLogin={handleLogin}
            onRegister={() => setIsRegistering(true)}
            onForgotPassword={() => setIsForgotPassword(true)}
          />
        )
      ) : (
        <div>
          <button onClick={handleLogout}>Выйти</button>
          <Profile token={token} />
        </div>
      )}
    </div>
  );
}

export default App;