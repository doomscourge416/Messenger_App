const { User } = require('../db');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const { email, nickname, password } = req.body;

    // Валидация данных
    if (!email || !password || !nickname) {
      return res.status(400).json({ message: 'Необходимо указать email, nickname и password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть минимум 6 символов.' });
    }

    // Проверяем наличие такого email или nickname у существующих пользователей
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { nickname }] } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Создание нового пользователя
    const user = User.build({ email, nickname });
    await user.setPassword(password);
    await user.save();

    try {
      await emailService.sendEmail(user.email, 'Регистрация в мессенджере', 'Вы успешно зарегистровались!');
    } catch (error) {
      console.warn('Email не отправлен:', error.message);
    }

    res.json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id } });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};