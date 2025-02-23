const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Отключение/включение уведомлений для чата
router.post('/mute', authMiddleware, notificationController.toggleMuteChat);

// Получение настроек уведомлений для чата
router.get('/:chatId', authMiddleware, notificationController.getNotificationSettings); // Строка 18

module.exports = router;