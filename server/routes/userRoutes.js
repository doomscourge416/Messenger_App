const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Получение профиля пользователя
router.get('/profile', authMiddleware, userController.getProfile);

// Обновление никнейма
router.put('/nickname', authMiddleware, userController.updateNickname);

// Обновление аватара
router.put('/avatar', authMiddleware, userController.updateAvatar);

// Переключение видимости email
router.put('/email-visibility', authMiddleware, userController.toggleEmailVisibility);

// Поиск пользователей
router.get('/search', authMiddleware, userController.searchUsers);

module.exports = router;