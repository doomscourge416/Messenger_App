import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WebSocketService from '../services/websocket';

const Chat = ({ chatId, token }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [participants, setParticipants] = useState([]); // Состояние для участников чата
  const [isAdmin, setIsAdmin] = useState(false); // Состояние для прав администратора
  const [isMuted, setIsMuted] = useState(false); // Состояние для мутинга чата
  const [forwardedHistory, setForwardedHistory] = useState([]); // Состояние для истории пересылок

  useEffect(() => {
    if (!chatId) return;

    // Создаем экземпляр WebSocket
    const websocket = new WebSocketService(chatId);

    // Подключаемся и передаем коллбэк для обработки сообщений
    websocket.connect((data) => {
      if (data.type === 'newMessage') {
        setMessages((prevMessages) => [...prevMessages, data]);
      } else if (data.type === 'editMessage') {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === data.id ? { ...msg, content: data.content } : msg))
        );
      } else if (data.type === 'deleteMessage') {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== data.id));
      }
    });

    // Очистка WebSocket при размонтировании компонента
    return () => {
      websocket.disconnect();
    };
  }, [chatId]);

  // Получение настроек уведомлений
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await axios.get(`/api/notifications/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsMuted(response.data.isMuted);
      } catch (error) {
        console.error('Ошибка при получении настроек уведомлений:', error.response?.data || error.message);
      }
    };

    fetchNotificationSettings();
  }, [chatId, token]);

  // Получение истории сообщений
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data.messages);
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
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

  // Пересылка сообщений
  const handleForward = async (messageId) => {
    try {
      const recipientChatId = prompt('Введите ID чата получателя:');
      if (!recipientChatId) return;

      await axios.post(
        '/api/messages/forward',
        { messageId, recipientChatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Сообщение успешно переслано!');
    } catch (error) {
      console.error('Ошибка при пересылке сообщения:', error.response?.data || error.message);
    }
  };

  // Мутинг чата
  const handleMute = async () => {
    try {
      await axios.post(
        '/api/notifications/mute',
        { chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsMuted((prev) => !prev); // Переключаем статус mute
      alert('Настройки уведомлений обновлены!');
    } catch (error) {
      console.error('Ошибка при управлении уведомлениями:', error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2>Чат #{chatId}</h2>

      {/* Форма отправки сообщений */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Введите сообщение..."
        />
        <button type="submit">Отправить</button>
      </form>

      {/* Список сообщений */}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.content}
            <button onClick={() => handleEdit(message.id, prompt('Введите новое сообщение:'))}>
              Редактировать
            </button>
            <button onClick={() => handleDelete(message.id)}>Удалить</button>
            <button onClick={() => handleForward(message.id)}>Переслать</button>
          </li>
        ))}
      </ul>

      {/* Участники чата */}
      <div>
        <h3>Участники:</h3>
        <ul>
          {participants.map((participant) => (
            <li key={participant.id}>
              {participant.nickname}
              {isAdmin && participant.isBanned && (
                <button onClick={() => handleUnbanParticipant(participant.id)}>Разбанить</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Кнопки управления чатом */}
      <div>
        <button onClick={handleMute}>{isMuted ? 'Включить уведомления' : 'Отключить уведомления'}</button>
      </div>
    </div>
  );
};

export default Chat;