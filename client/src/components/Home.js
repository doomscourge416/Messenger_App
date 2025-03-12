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
      <h2>Список чатов</h2>

      {/* Список чатов */}
      <ul>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li key={chat.id}>
              <Link to={`/chat/${chat.id}`} onClick={() => setSelectedChatId(chat.id)}>
                {chat.name || `Чат #${chat.id}`}
              </Link>
            </li>
          ))
        ) : (
          <p>Нет доступных чатов.</p>
        )}
      </ul>
    </div>
  );
};

export default Home;