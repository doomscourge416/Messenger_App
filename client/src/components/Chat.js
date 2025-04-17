import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import WebSocketService from '../services/websocket';
import { toast } from 'react-toastify';
import { NotificationProvider, useNotification } from './NotificationContext';
import '../Chat.css';




const Chat = () => {

  const { chatId } = useParams();
  // console.log('Текущий чат ID: ', chatId);
  const token = localStorage.getItem('messengerToken');

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  // const [isMuted, setIsMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState([]);
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [bannedParticipants, setBannedParticipants] = useState([]);
  // const [forwardedHistory, setForwardedHistory] = useState([]);

  const { isMuted, setIsMuted, playNotificationSound, showNotificationPopup } = useNotification();


  const fetchParticipants = async () => {

    if (!chatId) {
      console.warn('chatId в fetchParticipants не определен');
      return;
    }
    
    try {
      // console.log('fetchParticipants начал выполнение');
  
      const response = await axios.get(`/api/chats/participants/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // console.log('Ответ сервера от fetchParticipants:', response.data);
  
      if (response.data && Array.isArray(response.data.participants)) {
        setParticipants(response.data.participants);
      } else {
        console.warn('Сервер не вернул список участников:', response.data);
        alert('Не удалось загрузить участников.');
      }
  
      // Разделяем участников на активных и забаненных
      if (response.data.activeParticipants) {
        setActiveParticipants(response.data.activeParticipants);
      }
      if (response.data.bannedParticipants) {
        setBannedParticipants(response.data.bannedParticipants);
      }
    } catch (error) {
      console.log(error);
      console.error('Ошибка при получении участников:', error.response?.data || error.message);
      alert('Произошла ошибка при загрузке участников.');
    }
  };

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        console.log('Загрузка настроек уведомлений для chatId:', chatId);
        // if (!chatId) {
        //   console.warn('chatId не определен');
        //   return;
        // }
        const response = await axios.get(`/api/notifications/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Ответ сервера (настройки уведомлений):', response.data);
        setIsMuted(response.data.isMuted); // Устанавливаем состояние isMuted
        console.log('Текущее значение isMuted после загрузки:', response.data.isMuted);
      } catch (error) {
        console.error('Ошибка при получении настроек уведомлений:', error.response?.data || error.message);
      }
    };
  
    fetchNotificationSettings();
  }, [chatId, token, setIsMuted]);



  // Эффект для загрузки данных при изменении chatId
  useEffect(() => {
    
    if (!chatId) {
      console.warn('chatId в useEffect загрузки данных при изменении chatId не определен');
      return;
    }

    // console.log('useEffect вызвал fetchParticipants для chatId:', chatId);
    fetchParticipants();
  }, [chatId]);


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

  

  
  let isWebSocketInitialized = false;
  useEffect(() => {
    if (isWebSocketInitialized) {
      console.warn(' WebSocket уже инициализирован');
      return;
    }

    // Создаем экземпляр WebSocket
    const websocket = new WebSocketService(chatId, (data) => {
      if (data.type === 'newMessage') {
        
        setMessages((prev) => [...prev, data]);
        
        playNotificationSound(); // Воспроизводим звук уведомления
        showNotificationPopup(data); // Показываем всплывающее окно
        
        
        // TODO: Change back after data.type === 'newMessage' if anything breaks
        // setMessages((prev) => [...prev, data]);

        // if (!isMuted) {
        //   playNotificationSound();
        //   showNotificationPopup(data);
        // }

      }

    });

    // Подключаемся и передаем коллбэк для обработки сообщений
    websocket.connect((data) => {
      console.log('Получено событие WebSocket:', data);

      // TODO: это повтор того, что написано ниже

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.chatId === data.chatId ? { ...msg, isRead: true } : msg
        )
      );
      
      if (data.type === 'newMessage') {

        setMessages((prevMessages) => [...prevMessages, data]);

      } else if (data.type === 'editMessage') {

        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === data.id ? { ...msg, content: data.content } : msg))
        );

      } else if (data.type === 'deleteMessage') {

        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== data.id));

      } else if (data.type === 'messageStatusUpdated') {
        console.log('Получено событие messageStatusUpdated:', data);

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.chatId === data.chatId ? { ...msg, isRead: true } : msg
          )
        );

      }
    });

    // Отмечаем, что WebSocket инициализирован
    isWebSocketInitialized = true;

    return () => {
      websocket.disconnect();
    };

  }, [chatId]);  
 

 
  const handleMute = async () => {
    try {
      const response = await axios.post(
        '/api/notifications/mute',
        { chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsMuted(response.data.isMuted); // Обновляем состояние isMuted
      console.log('setIsMuted теперь ', response.data.isMuted)
      alert('Настройки уведомлений обновлены!');
      
    } catch (error) {
      console.error('Ошибка при управлении уведомлениями:', error.response?.data || error.message);
    }
    
  };




  // Получение истории сообщений
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // console.log('Загружаю сообщения для чата:', chatId);
        const response = await axios.get(`/api/messages/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log('Сообщения:', response.data.messages);
        setMessages(response.data.messages); // Устанавливаем сообщения в состояние
        setIsBanned(response.data.isBanned); // Обновляем статус бана
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.message) {
          alert(error.response.data.message); // Показываем сообщение об ошибке
        } else {
          console.error('Ошибка при загрузке сообщений:', error);
          alert('Не удалось загрузить сообщения.');
        }
      }
    };

    if (chatId) {
      fetchMessages();
    }
    // console.log('useEffect для fetchMessages выполнен');
  }, [chatId, token]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // Сохраняем выбранный файл в состоянии
    }
  };


  // Отправка сообщения через API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBanned) {
      alert('Вы забанены в этом чате');
      return;
    }

    try {

      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('content', content);

      if (selectedFile) {
        formData.append('file', selectedFile); // Добавляем файл, если он выбран
      }

      await axios.post(
        '/api/messages/send',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent(''); // Очищаем поле ввода
      setSelectedFile(null);
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

  useEffect(() => {
  const fetchChatDetails = async () => {
    try {
      // Запрашиваем данные чата
      const response = await axios.get(`/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Проверяем, является ли текущий пользователь администратором
      const isAdmin = response.data.chat.adminId === parseInt(localStorage.getItem('userId'), 10);
      setIsAdmin(isAdmin);
  
      // Загружаем данные администратора
      const adminResponse = await axios.get(`/api/user/${response.data.chat.adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminUser(adminResponse.data.user);
    } catch (error) {
      console.error('Ошибка при загрузке данных чата:', error.response?.data || error.message);
    }
  };


  
    if (chatId) {
      fetchChatDetails();
    }

    // console.log('useEffect для fetchChatDetails выполнен');

  }, [chatId, token]);


  // console.log('Текущий adminUser:', adminUser);


  const checkAdminStatus = async () => {
    try {
      const chatResponse = await axios.get(`/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAdmin(chatResponse.data.chat.adminId === parseInt(localStorage.getItem('userId'), 10));
    } catch (error) {
      console.error('Ошибка при проверке прав администратора:', error.response?.data || error.message);
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


  const handleTransferAdmin = async () => {
    try {
      const newAdminId = prompt('Введите ID нового администратора:');
      if (!newAdminId) return;
  
      await axios.post(
        '/api/chats/transfer-admin',
        { chatId, newAdminId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Права администратора успешно переданы!');
    } catch (error) {
      console.error('Ошибка при передаче прав администратора:', error.response?.data || error.message);
      alert('Не удалось передать права администратора.');
    }
  };


  useEffect(() => {
    // console.log('Текущее значение isAdmin:', isAdmin);
  }, [isAdmin]);


  const handleBanParticipant = async (participantId) => {
    try {
      console.log('Бан участника:', { chatId, participantId });
  
      // Проверяем, указан ли chatId и participantId
      if (!chatId || !participantId) {
        console.error('Некорректные данные для бана:', { chatId, participantId });
        alert('Некорректные данные для бана');
        return;
      }
  
      const response = await axios.put(
        '/api/chats/ban-participant',
        { chatId: parseInt(chatId, 10), participantId: parseInt(participantId, 10) }, // Преобразуем в числа
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Ответ сервера (бан):', response.data);
  
      alert('Участник успешно заблокирован!');
      fetchParticipants(); // Обновляем список участников
    } catch (error) {
      console.error('Ошибка при бане участника:', error.response?.data || error.message);
      alert('Не удалось заблокировать участника.');
    }
  };


  const handleAddParticipant = async () => {
    try {
      const participantId = prompt('Введите ID участника для добавления:');
      if (!participantId) return;
  
      await axios.post(
        '/api/chats/add-participant',
        { chatId, participantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Участник успешно добавлен!');
      fetchParticipants(); // Обновляем список участников
    } catch (error) {
      console.error('Ошибка при добавлении участника:', error.response?.data || error.message);
      alert('Не удалось добавить участника.');
    }
  };


  const handleRemoveParticipant = async (participantId) => {
    try {
      await axios.delete(`/api/chats/remove-participant/${participantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Участник успешно удален!');
      fetchParticipants(); // Обновляем список участников
    } catch (error) {
      console.error('Ошибка при удалении участника:', error.response?.data || error.message);
    }
  };


  const handleOpenAddParticipantModal = () => {
    setIsAddParticipantModalOpen(true);
  };
  
  const handleCloseAddParticipantModal = () => {
    setIsAddParticipantModalOpen(false);
    setNewParticipantEmail('');
  };
  
  const handleAddParticipantSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/chats/add-participant', 
        { chatId, email: newParticipantEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Участник успешно добавлен!');
      fetchParticipants(); // Обновляем список участников
      handleCloseAddParticipantModal();
    } catch (error) {
      console.error('Ошибка при добавлении участника:', error);
      toast.error('Не удалось добавить участника');
    }
  };


  // Функция разворачивания длинных сообщений
  const toggleExpand = (messageId) => {
    setExpandedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId) // Свернуть
        : [...prev, messageId] // Развернуть
    );
  };

  // Устанавливаем максимальную длину никнейма
  const truncateNickname = (nickname) => {
    if (nickname.length > 20) { 
      return `${nickname.substring(0, 20)}...`;
    }
    return nickname;
  };



  const checkAccess = async () => {
    try {
      const response = await axios.get(`/api/chats/access/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.accessGranted) {
        fetchParticipants();
      } else {
        alert('У вас нет доступа к этому чату.');
      }
    } catch (error) {
      console.error('Ошибка при проверке доступа:', error.response?.data || error.message);
      alert('Произошла ошибка при проверке доступа.');
    }
  };

  useEffect(() => {
    const markMessagesAsRead = async () => {

      console.log('chatId на момент выполнения useEffect(markMessagesAsRead)', chatId);

      if (!chatId) {
        console.warn('chatId в начале markMessagesAsRead не определён');
        return;
      };

      try {
        console.log('Отправляем запрос на пометку сообщений как прочитанных:', { chatId });
        await axios.post('/api/messages/mark-as-read', { chatId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Сообщения успешно помечены как прочитанные');
      } catch (error) {
        console.error('Ошибка при пометке сообщений:', error.response?.data || error.message);
      }
    };
  
    markMessagesAsRead();
  }, [chatId, token]);
  

  const handleFileUpload = async (event) => {

    const file = event.target.files[0];
    if(!file) return;
    console.log('Выбранный файл:', file);

    try {

      const formData = new FormData();
      formData.append('file', file);

      console.log('Отправляемый FormData:', formData);

      const response = await axios.post('/api/messages/send', formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log('Файл успешно загружен:', response.data.fileUrl);
      alert('Файл успешно загружен!');

    } catch (error) {

      console.error('Ошибка при загрузке файла: ', error.response?.data || error.message);
      console.error('Полная ошибка:', error);
      alert('Не удалось загрузить файл, Ошибка: ', error );

    }

  };

  const getFileNameFromUrl = (fileUrl) => {
    if (!fileUrl) return ''; // Если fileUrl отсутствует
  
    const fileName = fileUrl.split('.').pop(); // Получаем последний элемент пути
    return `.${fileName}`;
  };

  const getFileTypeIcon = (fileName) => {
    console.log('fileName:', fileName);
    if (!fileName) return '📁'; // Иконка для неизвестных файлов
  
    const extension = fileName.split('.').pop().toLowerCase();

    console.log('splited file name is : ', extension);
  
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'; // Иконка для изображений
      case 'pdf':
        return '📄'; // Иконка для PDF
      case 'txt':
        return '📝'; // Иконка для текстовых файлов
      case 'zip':
      case 'rar':
      case '7z':
        return '🗜️'; // Иконка для архивов
      default:
        return '📁'; // Иконка для остальных файлов
    }
  };

  
  return (
    
    
    <div className='chat-container'>

      <div className="chat-header">
      <h2>Чат #{chatId}</h2>
      </div>


      {/* Кнопки управления чатом */}
      <div className="notification-container">
        <button onClick={handleMute}>{isMuted ? 'Включить уведомления' : 'Отключить уведомления'}</button>
      </div>


      {/* Список сообщений */}
      <ul className="message-list">
        {isBanned ? (
          <p>Вы забанены в этом чате</p>
        ) : messages.length > 0 ? (
          
          messages.map((message) => {
            console.log('Message sender:', message.sender);
            return (
            <li key={message.id} className="message-item">

              <img
                src={message.sender.avatarUrl || '/default-avatar.png'}
                alt={`${message.sender.nickname}'s avatar`}
                className="round-img"
              />

              <span className="nickname">{truncateNickname(message.sender.nickname)} : </span>

              {/* Текстовое содержимое */}
              {message.content && (
                <p className={`message-content ${expandedMessages.includes(message.id) ? 'expanded' : ''}`}>
                  {message.content}
                </p>
              )}

              {/* Файл */}
              {message.fileUrl && (
                <div className="file-preview">
                  {/* Иконка файла */}
                  <span className="file-icon">
                    {getFileTypeIcon(message.fileUrl)}
                  </span>
                  {/* Название файла */}
                  <a href={message.fileUrl} download className="file-link" target="_blank" rel="noopener noreferrer">
                    {getFileNameFromUrl(message.fileUrl) || 'Скачать файл'}
                  </a>
                </div>
              )}

              <span className={`read-status ${message.isRead ? 'read' : 'unread'}`}>
                {message.isRead ? '✓ Прочитано' : '✗ Не прочитано'}
              </span>
              {message.content && message.content.length > 100 && !expandedMessages.includes(message.id) && (
                <button className="expand-button" onClick={() => toggleExpand(message.id)}>
                  Развернуть
                </button>
              )}
              {expandedMessages.includes(message.id) && (
                <button className="expand-button" onClick={() => toggleExpand(message.id)}>
                  Свернуть
                </button>
              )}


              {/* Кнопка для открытия меню */}
              <button
                className="message-actions-button"
                onClick={() => setMenuOpen(message.id === menuOpen ? null : message.id)}
              >
                ...
              </button>
              {/* Меню действий */}
              {menuOpen === message.id && (
                <div className="message-actions-menu">
                  <button onClick={() => handleEdit(message.id, prompt('Введите новое сообщение:'))}>
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(message.id)}>Удалить</button>
                  <button onClick={() => handleForward(message.id)}>Переслать</button>
                </div>
              )}
            </li>
          )})
        ) : (
          <p>Нет сообщений.</p>
        )}
      </ul>


      {/* Форма отправки сообщений */}
      <form onSubmit={handleSubmit} className="input-form">


          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Введите сообщение..."
          />

          <input type="file" id="fileInput" onChange={handleFileSelect} style={{ display: 'none' }} />

          <label 
            htmlFor="fileInput" 
            className={`file-upload-button ${selectedFile ? 'file-selected' : ''}`}
          >  
            {selectedFile ? (
              <img src="/check-icon.ico" alt="File Selected" /> // Иконка "галочка"
            ) : (
              <img src="/fileInput-icon.png" alt="Upload File" /> // Иконка "скрепка"
            )}

          </label>
          
          <button type="submit">Отправить</button>


      </form>


      {/* Участники чата */}
      <div className="participants-section">


        {/* ---------------------- ТЕСТОВЫЙ JSX ---------------------- */}


      <h3>Активные участники:</h3>
      <ul>
        {activeParticipants.length > 0 ? (
          activeParticipants.map((participant) => (
            <li key={participant.id}>
              <strong>{participant.nickname}</strong>
              {isAdmin && (
                <button onClick={() => handleBanParticipant(participant.id)}>Забанить</button>
              )}
            </li>
          ))
        ) : (
          <p>Нет активных участников в этом чате.</p>
        )}
      </ul>

      <h3>Забаненные участники:</h3>
      <ul>
        {bannedParticipants.length > 0 ? (
          bannedParticipants.map((participant) => (
            <li key={participant.id}>
              <strong>{participant.nickname}</strong>
              {isAdmin && (
                <button onClick={() => handleUnbanParticipant(participant.id)}>Разбанить</button>
              )}
            </li>
          ))
        ) : (
          <p>Нет забаненных участников в этом чате.</p>
        )}
      </ul>


      {/* ---------------------- ТЕСТОВЫЙ JSX ---------------------- */}




      {isAdmin !== null ? (
        <div className="admin-info">
          <strong>Администратор:</strong>
          <span>{adminUser?.nickname || 'Загрузка...'}</span>
        </div>
      ) : (
        <p>Администратор не найден</p>
      )}

      {participants.length > 0 ? (
        <ul>
          <div class="participants-section-footer">

            {/* TODO: */} 
            {/* <button onClick={handleAddParticipant}>Добавить участника</button> */}

            {/* Кнопка открытия модального окна */}
            <button onClick={handleOpenAddParticipantModal}>Добавить участника</button>

            {/* Модальное окно */}
            {isAddParticipantModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <span className="close" onClick={handleCloseAddParticipantModal}>&times;</span>
                  <h2>Добавить участника</h2>
                  <form onSubmit={handleAddParticipantSubmit}>
                    <input
                      type="email"
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      placeholder="Введите email участника"
                      required
                    />
                    <button type="submit">Добавить</button>
                  </form>
                </div>
              </div>
            )}

            <button onClick={handleTransferAdmin}>Передать права администратора</button>

          </div>
        </ul>
      ) : (
        <p>Нет участников в этом чате.</p>
      )}
        
        

    </div> 


      {/* Форма поиска */}
      <form onSubmit={handleSearchUsers} className="search-form">
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

                 
    </div>
    
  );
};

export default Chat;