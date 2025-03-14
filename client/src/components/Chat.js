import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import WebSocketService from '../services/websocket';

const Chat = () => {
  const { chatId } = useParams();
  const token = localStorage.getItem('messengerToken');
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [participants, setParticipants] = useState([]); // Состояние для участников чата
  const [isAdmin, setIsAdmin] = useState(false); // Состояние для прав администратора
  const [isMuted, setIsMuted] = useState(false); // Состояние для мутинга чата
  // const [forwardedHistory, setForwardedHistory] = useState([]); // Состояние для истории пересылок

      // Поиск пользователей
    const handleSearchUsers = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.get(`/api/user/search?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFoundUsers(response.data.users);
      } catch (error) {
        console.error('Ошибка при поиске пользователей:', error.response?.data || error.message);
        alert('Не удалось найти пользователей.');
      }
    };


    // Определение функции fetchParticipants
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`/api/chats/participants/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data.participants) {
          setParticipants(response.data.participants);
        } else {
          console.warn('Сервер не вернул список участников:', response.data);
          alert('Не удалось загрузить участников чата.');
        }
  
        // Проверяем, является ли текущий пользователь администратором
        const chatResponse = await axios.get(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAdmin(chatResponse.data.chat.adminId === parseInt(localStorage.getItem('userId'), 10));
      } catch (error) {
        console.error('Ошибка при получении участников чата:', error.response?.data || error.message);
        alert('Не удалось получить список участников.');
      }
    };

  useEffect(() => {
    if (!chatId) return;

    // Создаем экземпляр WebSocket
    const websocket = new WebSocketService(chatId);

    // Подключаемся и передаем коллбэк для обработки сообщений
    websocket.connect((data) => {
      console.log('Получено событие WebSocket:', data);
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

    // websocket.on('error', (error) => {
    //   console.error('Ошибка WebSocket:', error);
    // });

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
        console.log('Загружаю сообщения для чата:', chatId);
        const response = await axios.get(`/api/messages/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Сообщения:', response.data.messages);
        setMessages(response.data.messages); // Устанавливаем сообщения в состояние
      } catch (error) {
        console.error('Ошибка при получении сообщений:', error.response?.data || error.message);
      }
    };

    if (chatId) {
      fetchMessages();
    }
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

      console.log('Содержимое отредактированного сообщения: ',newContent);

      if (!newContent || newContent.trim() === '') {
        alert('Содержимое сообщения не может быть пустым.');
        return;
      }

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
      alert('Не удалось отредактировать сообщение.');
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
  
      await axios.post('/api/messages/forward', { messageId, recipientChatId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert('Сообщение успешно переслано!');
    } catch (error) {
      console.error('Ошибка при пересылке сообщения:', error.response?.data || error.message);
      alert('Не удалось переслать сообщение.');
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


  const handleUnbanParticipant = async (participantId) => {
    try {
      await axios.put(
        '/api/chats/unban-participant',
        { chatId, participantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Участник успешно разбанен!');
      fetchParticipants(); // Обновляем список участников
    } catch (error) {
      console.error('Ошибка при разбане участника:', error.response?.data || error.message);
      alert('Не удалось разбанить участника.');
    }
  };

  return (
    <div>
      <h2>Чат #{chatId}</h2>

      {/* Форма поиска */}
      <form onSubmit={handleSearchUsers}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск пользователей..."
        />
        <button type="submit">Найти</button>
      </form>


      {/* Результаты поиска */}
      {foundUsers.length > 0 && (
        <ul>
          {foundUsers.map((user) => (
            <li key={user.id}>
              {user.nickname} ({user.email})
            </li>
          ))}
        </ul>
      )}


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
        {messages.length > 0 ? (
          messages.map((message) => (
            <li key={message.id}>
              <strong>{message.sender.nickname}:</strong> {message.content}
              <button onClick={() => handleEdit(message.id, prompt('Введите новое сообщение:'))}>Редактировать</button>
              <button onClick={() => handleDelete(message.id)}>Удалить</button>
              <button onClick={() => handleForward(message.id)}>Переслать</button>
            </li>
          ))
        ) : (
          <p>Нет сообщений.</p>
        )}
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