import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WebSocketService from '../services/websocket';


const Chat = ({ chatId, token }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  // const [ws, setWs] = useState(null); TODO: нужна ли эта строка???

  useEffect(() => {
    // Создаем экземпляр WebSocket
    const websocket = new WebSocketService(chatId);
  
    // Подключаемся и передаем коллбэк для обработки сообщений
    websocket.connect((data) => { // Строка 30: передаем коллбэк
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

  const [isMuted, setIsMuted] = useState(false); // Строка 40

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await axios.get(`/api/notifications/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsMuted(response.data.isMuted); // Строка 45
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

  // Пересылка сообщений 
  const handleForward = async (messageId) => {
    try {
      const chatId = prompt('Введите ID чата получателя:'); // Строка 25: просим ID чата
      if (!chatId) return;
  
      await axios.post(
        '/api/messages/forward',
        { messageId, recipientId: chatId }, // Строка 27: передаем ID чата
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

  const handleMute = async (chatId) => {
    try {
      await axios.post(
        '/api/notifications/mute',
        { chatId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setIsMuted((prev) => !prev); // Строка 50: переключаем статус mute
      alert('Настройки уведомлений обновлены!');
    } catch (error) {
      console.error('Ошибка при управлении уведомлениями:', error.response?.data || error.message);
      alert('Не удалось обновить настройки уведомлений.');
    }
  };


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


  const [ forwardedHistory, setForwardedHistory ] = useState([]);

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



  return (
    <div>
      <h2>Чат #{chatId}</h2>

      <div style={{ display: 'inline-block', marginLeft: '10px' }}>
        <button onClick={() => handleMute(chatId)}>Отключить уведомления</button> {/* Строка 40 */}
      </div>

      <div style={{ display: 'inline-block', marginLeft: '10px' }}>
        <button onClick={() => handleTransferAdmin()}>Назначить администратора</button>
      </div>

      {/* История сообщений */}
      <div>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '10px' }}>
            <strong>{msg.sender?.nickname || 'Unknown'}: </strong> 
            {msg.content} ({msg.createdAt})

            {/* Контекстное меню для пересылки/редактирования/удаления */}

            <div style={{ display: 'inline-block', marginLeft: '10px' }}>
              <button onClick={() => handleForward(msg.id)}>
                Переслать
              </button>

              <button onClick={() => handleEdit(msg.id, prompt('Введите новое сообщение', msg.content))}>
                Редактировать
              </button>

              <button onClick={() => handleDelete(msg.id)}>
                Удалить
              </button>

              <button onClick={() => handleShowForwardedHistory(msg.id)}>
                Показать историю
              </button>
              

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