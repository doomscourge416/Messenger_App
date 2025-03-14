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

// Разбан участника
router.put('/unban-participant', authMiddleware, async (req, res) => {
  try {
    const { chatId, participantId } = req.body;
    const userId = req.userId;

    // Находим чат
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Проверяем права администратора
    if (chat.adminId !== userId) {
      return res.status(403).json({ message: 'Вы не являетесь администратором этого чата' });
    }

    // Разбаниваем участника
    await chat.update({
      bannedUsers: sequelize.fn('array_remove', sequelize.col('bannedUsers'), participantId),
    });

    res.json({ message: 'Участник успешно разбанен' });
  } catch (error) {
    console.error('Ошибка при разбане участника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;