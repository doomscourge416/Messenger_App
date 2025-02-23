import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';

const ChatList = ({ token }) => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {

    // Получаем список чатов пользователя
    const fetchChats = async () => {
      try {
        const response = await axios.get('/api/chats/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data.chats);
      } catch (error) {
        console.error('Ошибка при получении списка чатов:', error);
      }
    };

    fetchChats();

  }, [token]);


  // Поиск пользователей
  useEffect(() => {
    const searchUsers = async () => { // Строка 20
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



  if (!selectedChatId && chats.length > 0) {
    setSelectedChatId(chats[0].id); // Автоматически выбираем первый чат
  }

  return (
    <div>
      <h1>Список чатов</h1>


        {/* Форма для поиска пользователей */}
        <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Строка 45
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
          <li key={chat.id} style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}>
            <strong>{chat.type === 'private' ? 'Личный чат' : 'Групповой чат'}</strong>
            <ul>
              {chat.participants.map((participant) => (
                <li key={participant.id}>{participant.nickname}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {selectedChatId && <Chat chatId={selectedChatId} token={token} />}
    </div>
  );

};

export default ChatList;