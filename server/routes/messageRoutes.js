const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
// const { upload } = require('../middlewares/uploadMiddleware');

// Отправка сообщения
router.post('/send', uploadMiddleware.single('file'), authMiddleware, messageController.sendMessage);

// Получение сообщений по ID чата
router.get(`/chat/:chatId`, authMiddleware, messageController.getMessagesByChat);

// Пометка сообщений как прочитанных
router.post('/mark-as-read', authMiddleware, messageController.markAsRead);

// Редактирование сообщения
router.put('/edit/:messageId', authMiddleware, messageController.editMessage);

// Удаление сообщения
router.delete('/delete/:messageId', authMiddleware, messageController.deleteMessage);

// Пересылка сообщения
router.post('/forward', authMiddleware, messageController.forwardMessage);

// Загрузка файлов
// router.post('/send', uploadMiddleware.single('file'), messageController.uploadFile);

// TODO: Позже выяснить какой из двух вариантов необходим 
// Получение истории пересылок
router.get('/forwarded/:messageId', authMiddleware, messageController.getForwardedMessages);

// Получение пересланных сообщений
// router.get('/forwarded/:chatId', authMiddleware, messageController.getForwardedMessages);

module.exports = router;