import React, { useEffect, useState, useContext } from 'react';
import { NotificationProvider, useNotification } from './components/NotificationContext';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Импортируем Routes и Route
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { playNotificationSound, showNotificationPopup } from './components/Chat';

import Home from './components/Home';
import Chat from './components/Chat';
import ChatList from './components/ChatList';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './global.css';

function App() {

  const { playNotificationSound, showNotificationPopup } = useNotification();

  const [token, setToken] = useState(localStorage.getItem('messengerToken') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
      

  const [isMuted, setIsMuted] = useState(false);


  useEffect(() => {
    const storedToken = localStorage.getItem('messengerToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  

  // Добавляем токен в заголовки всех запросов
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    // console.log('Token:', token); // Лог токена
  }, [token]);


  useEffect(() => {
    
    if (!chatId) {
      console.warn('chatId в объявлении websocket-a на клиенте не определен');
      return;
    }
  
    const socket = new WebSocket(`ws://localhost:5000?chatId=${chatId}`);
  
    socket.onopen = () => {
      console.log('Подключен к WebSocket');
    };

    socket.on('messageStatusUpdated', (data) => {
      console.log('Получено событие messageStatusUpdated:', data);
    
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.chatId === data.chatId ? { ...msg, isRead: true } : msg
        )
      );
    });
  
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
          // Добавляем новое сообщение в список
          setMessages((prev) => [...prev, data]);
  
          // Воспроизводим звук уведомления, если мут выключен
          if (!isMuted) {
            console.log('Воспроизводим звук уведомления');
            playNotificationSound();
    
            console.log('Показываем всплывающее окно');
            showNotificationPopup(data);
          }

          
        } else if (data.type === 'editMessage') {
          // Обновляем содержимое сообщения
          setMessages((prev) =>
            prev.map((msg) => (msg.id === data.id ? { ...msg, content: data.content } : msg))
          );
        }
      } catch (error) {
        console.error('Ошибка при парсинге данных WebSocket:', error);
      }
    };
  
    socket.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
    };
  
    socket.onclose = () => {
      console.log('Отключен от WebSocket');
    };
  
    return () => {
      socket.close();
    };
  }, [chatId, isMuted]);



  return (
    <NotificationProvider>
      
        <Header token={token} setToken={setToken} />

        <Routes>
          <Route path="/" element={<Home token={token} />} />
          <Route path="/login" element={<Login setToken={setToken} setUserId={setUserId} />} />        <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile token={token} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/chats" element={<ChatList token={token} />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          {/* <Route path="/chats/participants/:chatId" element={<Chat />} /> */}
        </Routes>

        <ToastContainer />
      

    </NotificationProvider>
  );
}

export default App;