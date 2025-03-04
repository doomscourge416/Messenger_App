// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import ChatList from './components/ChatList';

import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register'; 
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  // const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  // Обработка входа
  const handleLogin = (newToken) => {

    setToken(newToken);
    // setUserId(newUserId);
    localStorage.setItem('messengerToken', newToken);

  };

  // Обработка выхода
  const handleLogout = () => {
    setToken(null);
    // setUserId(null);
    localStorage.removeItem('messengerToken');
    alert('Вы вышли из системы.');
  };

  const handleRegisterClick = () => setIsRegistering(true);
  const handleLoginClick = () => setIsRegistering(false);

  const handleForgotPasswordClick = () => setIsForgotPassword(true); 
  const handleBackClick = () => setIsForgotPassword(false);

  const handleResetPasswordClick = () => setIsResetPassword(true); // Сброс пароля
  const handleResetBackClick = () => setIsResetPassword(false); 

  
  return (
    <div className="App">
      <h1>Мессенджер</h1>

      {!token ? (
        isRegistering ? (
          <Register onBack={handleLoginClick} />
        ) : isForgotPassword ? (
          <ForgotPassword 
            onBack={handleBackClick} 
            onReset={handleResetPasswordClick}
          />
        ) : isResetPassword ? (
          <ResetPassword onBack={handleResetBackClick} />
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