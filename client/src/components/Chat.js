import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WebSocketService from '../services/websocket';

const Chat = ({ chatId, token }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [, setWs] = useState(null);
//   const [ws, setWs] = useState(null);

  useEffect(() => {

    // Создаем экземпляр WebSocket

    const websocket = new WebSocketService(chatId, token);
    websocket.connect();


    // Обработка новых сообщений
    
    websocket.setOnMessageCallback((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    setWs(websocket);


    // Очистка WebSocket при размонтировании компонента

    return () => {
      websocket.disconnect();
    };
  }, [chatId, token]);


  // Получение истории сообщений

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Преобразуем даты при получении сообщений
        const formattedMessages = response.data.messages.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt).toLocaleString(),
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Ошибка при получении сообщений:', error.response?.data || error.message);
      }
    };

    fetchMessages();

  }, [chatId, token]);


  // Отправка сообщения через API

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        '/api/messages/send',
        { chatId, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setContent(''); // Очищаем поле ввода
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error.response?.data || error.message);
    }
  };

  // Редактирование сообщения 

  const handleEdit = async (messageId, newContent) => {
    try {
      await axios.put(
        `/api/messages/edit/${messageId}`,
        { newContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
    } catch (error) {
      console.error('Ошибка при редактировании сообщения:', error.response?.data || error.message);
    }
  };

  // Удаление сообщения

  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`/api/messages/delete/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Ошибка при удалении сообщения:', error.response?.data || error.message);
    }
   };

   return (
    <div>
      <h2>Чат #{chatId}</h2>

      {/* История сообщений */}
      <div>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '10px' }}>
            <strong>{msg.sender.nickname}: </strong>
            {msg.content} ({msg.createdAt})

            {/* Контекстное меню для редактирования/удаления */}
            <div style={{ display: 'inline-block', marginLeft: '10px' }}>
              <button onClick={() => handleEdit(msg.id, prompt('Введите новое сообщение', msg.content))}>
                Редактировать
              </button>
              <button onClick={() => handleDelete(msg.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {/* Форма для отправки сообщения */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Введите сообщение..."
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

export default Chat;