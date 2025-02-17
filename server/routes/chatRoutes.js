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

// Создание чата
router.post('/create', authMiddleware, chatController.createChat);

module.exports = router;