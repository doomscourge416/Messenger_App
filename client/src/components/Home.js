import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = ({ token }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data);
      } catch (error) {
        console.error('Ошибка при получении чатов:', error.response?.data || error.message);
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
              <Link to={`/chat/${chat.id}`}>{chat.name || `Чат #${chat.id}`}</Link>
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