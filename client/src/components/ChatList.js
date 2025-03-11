import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';

const ChatList = ({ token }) => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

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
        {chats.map((chat) => (
          <li key={chat.id} 
          onClick={() => setSelectedChatId(chat.id)}
          style={{
            cursor: 'pointer',
            padding: '10px',
            borderBottom: '1px solid #ccc',
            backgroundColor: selectedChatId === chat.id ? '#ddd' : 'transparent',
          }}
          >
            <strong>{chat.type === 'private' ? 'Личный чат' : 'Групповой чат'}</strong>
            {chat.name || `Чат #${chat.id}`}
            <ul>
              {chat.participants.map((participant) => (
                <li key={participant.id}>{participant.nickname}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Отображение выбранного чата */}
      {selectedChatId && <Chat chatId={selectedChatId} token={token} />}
    </div>
  );
};

export default ChatList;