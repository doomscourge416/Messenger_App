const express = require('express');
const http = require('http');
const cors = require('cors');
const initializeWebSocket = require('./websocket');

// Подключение маршрутов
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Middleware для CORS
app.use(cors({ origin: 'http://localhost:3000' })); // Разрешаем доступ с клиента

// Middleware для парсинга JSON
app.use(express.json());

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes); // Строка 30

// Инициализация WebSocket
initializeWebSocket(server, app);

// Подключение к базе данных
const { sequelize } = require('./db');

// Проверка подключения к базе данных
async function startServer() {
  try {
    // Проверяем подключение к базе данных
    await sequelize.authenticate();
    console.log('Подключение к базе данных успешно установлено.');

    // Запускаем сервер
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при подключении к базе данных:', error);
    process.exit(1); // Останавливаем сервер в случае ошибки
  }
}

// Запуск сервера
startServer();