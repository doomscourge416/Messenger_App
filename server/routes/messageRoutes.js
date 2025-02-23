const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

// Отправка сообщения
router.post('/send', authMiddleware, messageController.sendMessage);

// Получение сообщений по ID чата
router.get('/chat/:chatId', authMiddleware, messageController.getMessagesByChat);

// Редактирование сообщения
router.put('/edit/:messageId', authMiddleware, messageController.editMessage);

// Удаление сообщения
router.delete('/delete/:messageId', authMiddleware, messageController.deleteMessage);

// Пересылка сообщения
router.post('/forward', authMiddleware, messageController.forwardMessage);

module.exports = router;