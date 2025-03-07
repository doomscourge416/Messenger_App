const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// Логирование для отладки
router.use((req, res, next) => {
  console.log('Запрос:', req.method, req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body); // Проверяем, что приходит в body
  next();
});

// Получение списка чатов
router.get('/list', authMiddleware, chatController.getChats);

// Получение чатов
router.get('/chats', authMiddleware, chatController.getChats);

// Создание чата
router.post('/create', authMiddleware, chatController.createChat);


// Назначение нового администратора
router.post('/transfer-admin', authMiddleware, chatController.transferAdmin);

module.exports = router;