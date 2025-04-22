const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { User } = require('../db');

const upload = multer({ dest: 'uploads/avatars/' });

// Маршрут загрузки аватара
router.put('/avatar', authMiddleware, upload.single('avatar'), (req, res, next) => {
    console.log('Запрос на загрузку аватара:', req.file, req.body);
    next();
  }, userController.updateAvatar);

// Получение профиля пользователя
router.get('/profile', authMiddleware, userController.getProfile);

// Обновление никнейма
router.put('/nickname', authMiddleware, userController.updateNickname);

// Обновление аватара
// router.put('/avatar', authMiddleware, userController.updateAvatar);

// Переключение видимости email
router.put('/email-visibility', authMiddleware, userController.toggleEmailVisibility);

// Поиск пользователей
router.get('/search', authMiddleware, userController.searchUsers);

// Получение информации о пользователе по ID
router.get('/:userId', authMiddleware, userController.getUserById);

module.exports = router;