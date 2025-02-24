import React, { useState } from 'react';
// import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatList from './components/ChatList';
import Login from './components/Login';
import Register from './components/Register'; 

function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  // const [userId, setUserId] = useState(null); // Неиспользуется userId

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

  
  return (
    <div className="App">
      <h1>Мессенджер</h1>

      {!token ? (
        isRegistering ? (
          <Register onRegister={handleLoginClick} />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onRegister={handleRegisterClick} // Передаем handleRegisterClick как onRegister
          />
        )
      ) : (
        <div>
          <button onClick={handleLogout}>Выйти</button>
          <ChatList token={token} />
        </div>
      )}
    </div>
  );
}

export default App;