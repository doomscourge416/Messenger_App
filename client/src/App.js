import React, { useState } from 'react';
// import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatList from './components/ChatList';

function App() {
  const [token, setToken] = useState(null);
  const setUserId = useState(null);
  // const [userId, setUserId] = useState(null); // Неиспользуется userId

  // Аутентификация
  const handleLogin = async () => {
    try {

      console.log('Попытка входа...');
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'user2@example.com',
        password: 'password123',
      });

      if (response.data.token) {
        console.log('Получен токен:', response.data.token);
        setToken(response.data.token);  // Сохраняем токен
        setUserId(response.data.user.id);  // и Юзер Айди 
        
      } else {
        console.error('Токен не получен');
      }
      
    } catch (error) {
      console.error('Ошибка при входе:', error.response?.data || error.message);
    }
  };

  return (
    <div className="App">
      <h1>Мессенджер</h1>

      {!token ? (
        <button onClick={handleLogin}>Войти</button>
      ) : (
        <ChatList token={token} />
      )}
    </div>
  );
}

export default App;