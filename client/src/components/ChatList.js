import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatList = ({ token }) => {
  const [chats, setChats] = useState([]);

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

  console.log('State chats:', chats);

  return (
    <div>
      <h2>Список чатов</h2>
      <ul>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li key={chat.id}>
              <strong>{chat.type === 'private' ? 'Личный чат' : 'Групповой чат'}</strong>
              <ul>
                {chat.participants.map((participant) => (
                  <li key={participant.id}>{participant.nickname}</li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <p>Чатов нет</p>
        )}
      </ul>
    </div>
  );
};

export default ChatList;