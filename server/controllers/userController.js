import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WebSocketService from '../services/websocket';

const Chat = ({ chatId, token }) => {
  const [messages, setMessages] = useState([]); // Состояние для сообщений
  const [content, setContent] = useState(''); // Состояние для нового сообщения
  const [participants, setParticipants] = useState([]); // Состояние для участников чата
  const [isAdmin, setIsAdmin] = useState(false); // Строка 10: состояние для прав администратора
  const [isMuted, setIsMuted] = useState(false); // Строка 40: состояние для мутинга чата
  const [forwardedHistory, setForwardedHistory] = useState([]); // Состояние для истории пересылок

  const [searchQuery, setSearchQuery] = useState(''); // Строка 30: строка поиска
  const [foundUsers, setFoundUsers] = useState([]); // Найденные пользователи

  useEffect(() => {
    if (!chatId) return;

    // Создаем экземпляр WebSocket
    const websocket = new WebSocketService(chatId); // Строка 30: исправляем WebSock etService → WebSocketService

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
        if (!chatId) return; // Строка 45: проверяем chatId
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
        if (!chatId) return;
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

  // Получение списка участников чата
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        if (!chatId) return;

        const response = await axios.get(`/api/chats/participants/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.participants) {
          setParticipants(response.data.participants); // Устанавливаем участников
        } else {
          console.warn('Сервер не вернул список участников:', response.data);
          alert('Не удалось загрузить участников чата.');
        }

        // Проверяем права администратора
        const chatResponse = await axios.get(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsAdmin(chatResponse.data.chat.adminId === parseInt(localStorage.getItem('userId'), 10));
      } catch (error) {
        console.error('Ошибка при получении участников чата:', error.response?.data || error.message);
        alert('Не удалось получить список участников.');
      }
    };

    if (chatId) {
      fetchParticipants(); // Вызываем функцию при загрузке компонента
    }
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
      alert('Не удалось отправить сообщение.');
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
      alert('Не удалось удалить сообщение.');
    }
  };

  // Пересылка сообщений
  const handleForward = async (messageId) => {
    try {
      const recipientChatId = prompt('Введите ID чата получателя:'); // Строка 25: просим ID чата
      if (!recipientChatId) return;

      await axios.post(
        '/api/messages/forward',
        { messageId, recipientId: recipientChatId }, // Строка 27: передаем ID чата
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Сообщение успешно переслано!');
    } catch (error) {
      console.error('Ошибка при пересылке сообщения:', error.response?.data || error.message);
      alert('Не удалось переслать сообщение.');
    }
  };

  // Показать историю пересылок
  const handleShowForwardedHistory = async (messageId) => {
    try {
      const response = await axios.get(`/api/messages/forwarded/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForwardedHistory(response.data.forwardedHistory); // Строка 70
    } catch (error) {
      console.error('Ошибка при получении истории пересылок:', error.response?.data || error.message);
      alert('Не удалось получить историю пересылок.');
    }
  };

  // Бан/разбан участника
  const handleBanParticipant = async (participantId) => {
    try {
      await axios.put(
        '/api/chats/ban-participant',
        { chatId, participantId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Участник успешно заблокирован!');
      fetchParticipants(); // Обновляем список участников
    } catch (error) {
      console.error('Ошибка при бане участника:', error.response?.data || error.message);
      alert('Не удалось заблокировать участника.');
    }
  };

  const handleUnbanParticipant = async (participantId) => {
    try {
      await axios.put(
        '/api/chats/unban-participant',
        { chatId, participantId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Участник успешно разблокирован!');
      fetchParticipants(); // Обновляем список участников
    } catch (error) {
      console.error('Ошибка при разбане участника:', error.response?.data || error.message);
      alert('Не удалось разблокировать участника.');
    }
  };

  // Поиск пользователей
  useEffect(() => {
    const handleSearchUsers = async () => {
      if (!searchQuery.trim()) {
        setFoundUsers([]); // Очищаем список, если запрос пустой
        return;
      }

      try {
        const response = await axios.get(`/api/users/search?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFoundUsers(response.data.users); // Убедитесь, что сервер возвращает users
      } catch (error) {
        console.error('Ошибка при поиске пользователей:', error.response?.data || error.message);
        alert('Не удалось найти пользователей.');
      }
    };

    const delayDebounceFn = setTimeout(() => {
      handleSearchUsers();
    }, 300); // Задержка для дебаунса

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token]);

  // Добавление участника в чат
  const handleAddParticipant = async (participantId) => {
    try {
      await axios.post(
        '/api/chats/add-participant',
        { chatId, participantId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Участник успешно добавлен!');
      fetchParticipants(); // Обновляем список участников
    } catch (error) {
      console.error('Ошибка при добавлении участника:', error.response?.data || error.message);
      alert('Не удалось добавить участника.');
    }
  };

  // Назначение нового администратора
  const handleTransferAdmin = async () => {
    try {
      const newAdminId = prompt('Введите ID нового администратора:');
      if (!newAdminId) return;

      await axios.post(
        '/api/chats/transfer-admin',
        { chatId, newAdminId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Администратор успешно назначен!');
    } catch (error) {
      console.error('Ошибка при назначении администратора:', error.response?.data || error.message);
      alert('Не удалось назначить нового администратора.');
    }
  };

  // Мутинг чата
  const handleMute = async () => {
    try {
      await axios.post(
        `/api/notifications/mute`,
        { chatId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsMuted((prev) => !prev); // Переключаем статус mute
      alert('Настройки уведомлений обновлены!');
    } catch (error) {
      console.error('Ошибка при управлении уведомлениями:', error.response?.data || error.message);
      alert('Не удалось обновить настройки уведомлений.');
    }
  };

  return (
    <div>
      <h2>Чат #{chatId}</h2>

      {/* Кнопки управления чатом */}
      <div>
        <button onClick={handleMute}>Отключить уведомления</button> {/* Строка 50 */}
        <button onClick={handleTransferAdmin}>Назначить администратора</button>
      </div>

      {/* Список участников чата */}
      <div>
        <h3>Участники чата:</h3>
        {participants.length > 0 ? (
          participants.map((participant) => (
            <div key={participant.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <strong>{participant.nickname}</strong>
              {isAdmin && !participant.isBanned && ( // Строка 288: проверяем права администратора
                <button onClick={() => handleBanParticipant(participant.id)}>Забанить</button>
              )}
              {isAdmin && participant.isBanned && ( // Строка 291: проверяем права администратора
                <button onClick={() => handleUnbanParticipant(participant.id)}>Разбанить</button>
              )}
            </div>
          ))
        ) : (
          <p>Нет участников в этом чате.</p>
        )}
      </div>

      {/* Форма поиска пользователей */}
      <form onSubmit={handleSearchUsers}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Обновляем searchQuery при вводе
          placeholder="Поиск пользователей..."
        />
        <button type="submit">Найти</button>
      </form>

      {/* Результаты поиска */}
      {foundUsers.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {foundUsers.map((user) => (
            <li key={user.id} style={{ margin: '5px 0' }}>
              {user.nickname} ({user.email})
              <button onClick={() => handleAddParticipant(user.id)}>Добавить в чат</button> {/* Строка 30 */}
            </li>
          ))}
        </ul>
      )}

      {/* История сообщений */}
      <div>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '10px' }}>
              <strong>{msg.sender?.nickname || 'Unknown'}:</strong> {msg.content} ({msg.createdAt})

              {/* Контекстное меню для сообщений */}
              <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                <button onClick={() => handleForward(msg.id)}>Переслать</button>
                <button onClick={() => handleEdit(msg.id, prompt('Введите новое сообщение', msg.content))}>
                  Редактировать
                </button>
                <button onClick={() => handleDelete(msg.id)}>Удалить</button>
                <button onClick={() => handleShowForwardedHistory(msg.id)}>
                  Показать историю {/* Строка 70 */}
                </button>
              </div>

              {/* История пересылок */}
              {forwardedHistory.length > 0 && (
                <ul style={{ listStyleType: 'none', padding: 0, marginTop: '5px' }}>
                  {forwardedHistory.map((entry) => (
                    <li key={entry.id} style={{ color: '#6c757d', fontSize: '0.9em' }}>
                      Переслано в чат #{entry.forwardedChat.id}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <p>Нет сообщений в этом чате.</p>
        )}
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