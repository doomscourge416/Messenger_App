const express = require('express');
const http = require('http');
const initializeWebSocket = require('./websocket');

const app = express();
const server = http.createServer(app);

// Middleware для парсинга JSON
app.use(express.json()); // Эта строка должна быть обязательно!

// Подключение маршрутов аутентификации
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Подключение маршрутов чатов
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);

// Синхронизация моделей с базой данных
const { sequelize } = require('./db');
sequelize.sync({ alter: true }).then(() => {
  console.log('База данных синхронизирована');
});

// Инициализация WebSocket
initializeWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});