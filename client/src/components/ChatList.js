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

        const chatsWithUnread = response.data.chats.map((chat) => ({
          ...chat,
          unreadCount: chat.messages?.filter((msg) => !msg.isRead)?.length || 0, // Строка 45
        }));

        setChats(chatsWithUnread);
      } catch (error) {
        console.error('Ошибка при получении чатов:', error.response?.data || error.message);
      }
    };

    fetchChats();
  }, [token]);

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
      if (!selectedChatId) return; // Строка 80

      try {
        await axios.post(
          '/api/messages/mark-as-read',
          { chatId: selectedChatId }, // Используем selectedChatId
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error('Ошибка при пометке сообщений:', error.response?.data || error.message);
      }
    };

    markMessagesAsRead();
  }, [selectedChatId, token]); // Строка 95

  // Автоматический выбор первого чата
  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id); // Строка 76
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
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)} // Выбор чата
            style={{
              cursor: 'pointer',
              padding: '10px',
              borderBottom: '1px solid #ccc',
              backgroundColor: selectedChatId === chat.id ? '#ddd' : 'transparent',
            }}
          >
            <strong>{chat.type === 'private' ? 'Личный чат' : 'Групповой чат'}</strong>
            {/* Счетчик непрочитанных сообщений */}
            {chat.unreadCount > 0 && (
              <span style={{ color: 'red', marginLeft: '5px' }}>[{chat.unreadCount}]</span>
            )}
            <ul>
              {chat.participants.map((participant) => (
                <li key={participant.id}>{participant.nickname}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Отображение выбранного чата */}
      {selectedChatId && <Chat chatId={selectedChatId} token={token} />} {/* Строка 90 */}
    </div>
  );
};

export default ChatList;