const express = require('express');
const http = require('http');
const initializeWebSocket = require('./websocket'); // Импортируем функцию

const app = express();
const server = http.createServer(app);

// Инициализация WebSocket
initializeWebSocket(server); // Вызываем функцию

// Middleware для JSON
app.use(express.json());

// Подключение маршрутов аутентификации
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Синхронизация моделей с базой данных
const { sequelize } = require('./db');
sequelize.sync({ alter: true }).then(() => {
  console.log('База данных синхронизирована');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});