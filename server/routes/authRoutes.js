const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;

        // Проверяем токен  и обновляем статус подтверждения email
        const user = await User.findOne({ where: { verificationToken: token } });
        if (!user) {
            return res.status(400).json({ message: 'Неверный или истёкший токен подтверждения' });
        };

        user.isEmailVerified = true;
        user.verificationToken = null;
        await user.save();

        res.json({ message: 'Email успешно подтвержден' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    };
});

router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Этот маршрут защищен' });
});

// // Отправка ссылки восстановления
// router.post('/forgot-password', authController.sendResetPasswordEmail);

// // Сброс пароля 
// router.get('/reset-password', authController.resetPassword);

// Генерация восстановления кода
router.post('/forgot-password', authController.generateResetCode);

// Проверка кода восстановления и сброс пароля
router.put('/reset-password', authController.verifyResetCode);

// Изменение пароля
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;