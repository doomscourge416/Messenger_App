const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../db');

exports.register = async (req, res) => {
  try {
    const { email, nickname, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const user = User.build({ email, nickname, isEmailVerified: false });
    await user.setPassword(password);
    user.verificationToken = user.generateVerificationToken();
    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/verify?token=${user.verificationToken}`;
    const html = `<p>Подтвердите ваш email, перейдя по ссылке:</p><a href="${verificationLink}">${verificationLink}</a>`
    require('../services/emailService')(email, 'Подтверждение регистрации', html);

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован. Проверьте почту для подтверждения.' });
  } catch (error) {
    console.error(error);
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
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};