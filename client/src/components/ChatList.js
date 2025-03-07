import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';

const ChatList = ({ token }) => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('/api/chats/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log('Ответ сервера:', response.data);
        setChats(response.data.chats); // Убедитесь, что данные сохраняются
      } catch (error) {
        console.error('Ошибка при получении чатов:', error.response?.data || error.message);
      }
    };
  
    fetchChats();
  }, [token]);
  
  console.log('State chats:', chats);

  // Поиск пользователей
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery) {
        setFoundUsers([]);
        return;
      }

      try {
        const response = await axios.get(`/api/user/search?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFoundUsers(response.data.users);
      } catch (error) {
        console.error('Ошибка при поиске пользователей:', error.response?.data || error.message);
      }
    };

    searchUsers();
  }, [searchQuery, token]);

  // Помечаем сообщения как прочитанные
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!selectedChatId) return;

      try {
        await axios.post(
          '/api/messages/mark-as-read',
          { chatId: selectedChatId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error('Ошибка при пометке сообщений:', error.response?.data || error.message);
      }
    };

    markMessagesAsRead();
  }, [selectedChatId, token]);

  // Автоматический выбор первого чата
  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  return (
    <div>
      <h1>Список чатов</h1>

      {/* Форма для поиска пользователей */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск пользователей..."
        />
        <ul>
          {foundUsers.map((user) => (
            <li key={user.id}>
              {user.nickname} ({user.email})
            </li>
          ))}
        </ul>
      </div>

      {/* Список чатов */}
      <div>
      {chats.length > 0 ? (
        chats.map(chat => <div key={chat.id}>{chat.name}</div>)
      ) : (
        <p>Нет чатов</p>
      )}
      </div>
      <ul>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              style={{
                cursor: 'pointer',
                padding: '10px',
                borderBottom: '1px solid #ccc',
                backgroundColor: selectedChatId === chat.id ? '#ddd' : 'transparent',
              }}
            >
              <strong>{chat.type === 'private' ? 'Личный чат' : 'Групповой чат'}</strong>
              {chat.unreadCount > 0 && (
                <span style={{ color: 'red', marginLeft: '5px' }}>[{chat.unreadCount}]</span>
              )}
              <ul>
                {chat.participants.map((participant) => (
                  <li key={participant.id}>{participant.nickname}</li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <p>Нет доступных чатов</p>
        )}
      </ul>

      {/* Отображение выбранного чата */}
      {selectedChatId && <Chat chatId={selectedChatId} token={token} />}
    </div>
  );
};

console.log('Token:', token);

export default ChatList;