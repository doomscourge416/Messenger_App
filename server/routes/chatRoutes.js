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

// Получение списка участников
router.get('/:chatId/participants', authMiddleware, chatController.getParticipants);

// Создание чата
router.post('/create', authMiddleware, chatController.createChat);

// Назначение нового администратора
router.post('/transfer-admin', authMiddleware, chatController.transferAdmin);

// Блокировка участника
router.put('/ban-participant', authMiddleware, chatController.banParticipant);

// Разбан участника
router.put('/unban-participant', authMiddleware, chatController.unbanParticipant);

// Добавление участника 
router.post('/add-participant', authMiddleware, chatController.addParticipant);

// Удаление участника
router.delete('remove-participant', authMiddleware, chatController.removeParticipant);

module.exports = router;