import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = ({ token }) => {
  const [chats, setChats] = useState([]); // Инициализация пустым массивом

  useEffect(() => {
    const fetchChats = async () => {
      try {
        console.log('Начинаю запрос к /api/chats/list');
        const response = await axios.get('/api/chats/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Ответ сервера:', response.data);

        // Убедитесь, что данные имеют правильную структуру
        if (response.data && Array.isArray(response.data.chats)) {
          setChats(response.data.chats);
        } else {
          console.warn('Сервер не вернул список чатов:', response.data);
          setChats([]); // Устанавливаем пустой массив, если данные отсутствуют
        }
      } catch (error) {
        console.error('Ошибка при получении чатов:', error.response?.data || error.message);
        setChats([]); // Устанавливаем пустой массив в случае ошибки
      }
    };

    if (token) {
      fetchChats();
    }
  }, [token]);

  return (
    <div>
      <h2>Список чатов</h2>
      {chats.length > 0 ? (
        <ul>
          {chats.map((chat) => (
            <li key={chat.id}>
              {chat.name || `Чат #${chat.id}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет доступных чатов.</p>
      )}
    </div>
  );
};

export default Home;