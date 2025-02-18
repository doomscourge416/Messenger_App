const express = require('express');
const http = require('http');
const cors = require('cors');
const initializeWebSocket = require('./websocket');

const app = express();
const server = http.createServer(app);

// Middleware для CORS
app.use(cors({ origin: 'http://localhost:3000 '})); // Разрешаю доступ с клиента

// Middleware для парсинга JSON
app.use(express.json());

// Подключение маршрутов аутентификации
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Подключение маршрутов чатов
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);

// Подключение маршрутов сообщений
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// Синхронизация моделей с базой данных
const { sequelize } = require('./db');
sequelize.sync({ alter: true }).then(() => {
  console.log('База данных синхронизирована');
});

// Инициализация WebSocket
initializeWebSocket(server, app); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});