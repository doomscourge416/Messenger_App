import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = ({ token }) => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // Загрузка списка чатов
  useEffect(() => {
    const fetchChats = async () => {
      try {
        console.log('Начинаю запрос к /api/chats/list');
        const response = await axios.get('/api/chats/list', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Ответ сервера:', response.data);
        setChats(response.data.chats);
      } catch (error) {
        console.error('Ошибка при получении чатов:', error.response?.data || error.message);
      }
    };

    fetchChats();
  }, [token]);

  // Логирование обновления состояния chats
  useEffect(() => {
    console.log('State chats обновлен:', chats);
  }, [chats]);

  return (
    <div>
      <h1>HOME JS</h1>
       
      <div className="home-container">
        <h1>Добро пожаловать в мессенджер!</h1>
        <p>Выберите действие:</p>
        <ul>
          <li>
            <Link to="/chats">Перейти к списку чатов</Link>
          </li>
          <li>
            <Link to="/profile">Мой профиль</Link>
          </li>
          <li>
            <Link to="/settings">Настройки</Link>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default Home;