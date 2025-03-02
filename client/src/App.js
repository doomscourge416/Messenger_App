import React, { useState } from 'react';
// import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatList from './components/ChatList';
import Login from './components/Login';
import Register from './components/Register'; 
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import resetPassword from './components/ResetPassword';

function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Обработка входа
  const handleLogin = (newToken, newUserId) => {

    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem('messengerToken', newToken);

  };

  // Обработка выхода
  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('messengerToken');
    alert('Вы вышли из системы.');
  };

  // Преключение на форму регистрации
  const handleRegisterClick = () => {
    setIsRegistering(true);
  };

  // Возврат к форме входа
  const handleLoginClick = () => {
    setIsRegistering(false);
  };

  const handleForgotPasswordClick = () => setIsForgotPassword(true); 
  const handleBackClick = () => setIsForgotPassword(false);

  
  return (
    <div className="App">
      <h1>Мессенджер</h1>

      {!token ? (
        isRegistering ? (
          <Register onRegister={handleLoginClick} />
        ) : isForgotPassword ? ( 
          <ForgotPassword onBack={handleBackClick} />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onRegister={handleRegisterClick} 
            onForgotPassword={handleForgotPasswordClick} 
          />
        )
      ) : (
        <div>
          <button onClick={handleLogout}>Выйти</button>
          
          {/* Отображаем профиль */}
          <Profile token={token} />
        </div>
      )}
    </div>
  );
}

export default App;