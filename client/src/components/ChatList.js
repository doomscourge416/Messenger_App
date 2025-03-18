import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Chat from './Chat';
import '../index.css';
import '../Chat.css';
import '../global.css';
import '../App.css';

const ChatList = ({ token }) => {
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const setMessages = useState('');


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


  console.log('State chats:', chats); // Лог состояния чатов
  useEffect(() => {
    console.log('State chats обновлен:', chats);
  }, [chats]);


  return (
    <div className="chat-list-container">
      <h2 className="chat-list-header">Список чатов</h2>
      <ul className="chat-list">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li key={chat.id} className="chat-item">
              <Link to={`/chat/${chat.id}`}>
                <strong>{chat.type === 'private' ? 'Личный чат' : 'Групповой чат'}</strong>
                <span>{chat.name || `Чат #${chat.id}`}</span>
                <ul>
                  {chat.participants.map((participant) => (
                    <li key={participant.id}>

                    <img
                        src={participant.avatarUrl || '/default-avatar.png'}
                        alt={`${participant.nickname}'s avatar`}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%', // Круглая форма
                          objectFit: 'cover', // Обрезка изображения
                          marginRight: '10px',
                        }}
                      />

                      {participant.nickname}
                      </li>
                  ))}
                </ul>
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



export default ChatList;