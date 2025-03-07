const express = require('express');
const http = require('http');
const cors = require('cors');
const initializeWebSocket = require('./websocket');
// Подключение маршрутов аутентификации
const authRoutes = require('./routes/authRoutes');
// Подключение маршрутов чатов
const chatRoutes = require('./routes/chatRoutes');
// Подключение маршрутов сообщений
const messageRoutes = require('./routes/messageRoutes');
// Подключение маршрутов нотификаций
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Middleware для CORS
app.use(cors({ origin: 'http://localhost:3000 '})); // Разрешаю доступ с клиента

// Middleware для парсинга JSON
app.use(express.json());


app.use('/api/auth', authRoutes);


app.use('/api/chats', chatRoutes);


app.use('/api/messages', messageRoutes);

// Синхронизация моделей с базой данных
const { sequelize } = require('./db');
sequelize.sync({ force: true }).then(() => {
  console.log('База данных синхронизирована');
})
.catch((error) => {
  console.error('Ошибка при синхронизации базы данных:', error);
});


app.use('/api/notifications', notificationRoutes); // Строка 30

// Инициализация WebSocket
initializeWebSocket(server, app); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});