import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Chat from './Chat';
import '../index.css';
import '../Chat.css';
import '../global.css';
import '../App.css';

const ChatList = ({ token }) => {
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // Поисковый запрос
  const [foundUsers, setFoundUsers] = useState([]); // Найденные пользователи
  const [selectedParticipants, setSelectedParticipants] = useState([]); // Выбранные участники
  const [chatType, setChatType] = useState('private'); // Тип чата: private или group
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
    }
  };

  // Добавление участника в выбранных
  const handleAddParticipant = (user) => {
    if (!selectedParticipants.some((p) => p.id === user.id)) {
      setSelectedParticipants([...selectedParticipants, user]);
    }
  };

  // Удаление участника из выбранных
  const handleRemoveParticipant = (userId) => {
    setSelectedParticipants(selectedParticipants.filter((p) => p.id !== userId));
  };

  // Создание чата
  const handleCreateChat = async () => {
    try {

      if (chatType === 'private' && selectedParticipants.length > 1) {
        toast.error('Личный чат можно создать только с одним участником!');
        return; // Прерываем выполнение функции если личный чат хотят создать с более чем 1 пользователем
      }

      const participantIds = selectedParticipants.map((p) => p.id);

      const response = await axios.post(
        '/api/chats/create',
        { participants: participantIds, type: chatType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Чат успешно создан:', response.data.chat);
      
      setChats((prevChats) => [...prevChats, response.data.chat]); // Добавляем новый чат
      setSelectedParticipants([]); // Очищаем выбранных участников

      toast.success('Чат успешно создан!');
      // alert('Чат успешно создан!');
      // window.location.reload(); // Перезагружаем страницу

    } catch (error) {
      console.error('Ошибка при создании чата:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);


  return (
    <div>
      <div className="chat-list-container">
        <h2 className="chat-list-header">Список чатов</h2>
        <ul className="chat-list">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <li key={chat.id}
              onClick={()=> setSelectedChatId(chatId)}
              className="chat-item">
                <Link to={`/chat/${chat.id}`}>

                  <strong>{chat.type === 'private' ? 'Личный чат' : 'Групповой чат'}</strong>

                  <span>{chat.name || `Чат #${chat.id}`}</span>

                  <ul>
                    {chat.participants && Array.isArray(chat.participants) ?

                      chat.participants.map((participant) => (
                        <li key={participant.id}>

                          <img
                            src={participant.avatarUrl || '/default-avatar.png'}
                            alt={`${participant.nickname}'s avatar`}
                            className="round-img"
                          />

                          {participant.nickname}
       
                        </li>
                        
                      )) : null};

                  </ul>

                </Link>

              </li>
            ))
          ) : (
            <p>Нет доступных чатов.</p>
          )}
        </ul>
      </div>


      {/* Форма для создания чата */}
      <div className='create-chat-container' style={{ marginBottom: '20px' }}>

        <h3>Создать новый чат</h3>
        <form onSubmit={handleSearchUsers}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск пользователей..."
          />
          <button type="submit">Найти</button>
        </form>

        {/* Найденные пользователи */}
        <ul>
          {foundUsers.map((user) => (
            <li key={user.id} onClick={() => handleAddParticipant(user)}>
              {user.nickname} ({user.email})
            </li>
          ))}
        </ul>

        {/* Выбранные участники */}
        <div>
          <h4>Участники:</h4>
          <ul>
            {selectedParticipants.map((participant) => (
              <li key={participant.id}>
                {participant.nickname}
                <button onClick={() => handleRemoveParticipant(participant.id)}>Убрать</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Выбор типа чата */}
        <div>
          <label>
            <input
              type="radio"
              name="chatType"
              value="private"
              checked={chatType === 'private'}
              onChange={() => setChatType('private')}
            />
            Личный чат
          </label>
          <label>
            <input
              type="radio"
              name="chatType"
              value="group"
              checked={chatType === 'group'}
              onChange={() => setChatType('group')}
            />
            Групповой чат
          </label>
        </div>

        {/* Кнопка создания чата */}
        <button onClick={handleCreateChat}>Создать чат</button>

      </div>

    </div>
  );
};



export default ChatList;