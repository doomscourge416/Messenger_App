const { User } = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

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
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { nickname }], }, });
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

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Необходимо указать oldPassword и newPassword' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен быть минимум 6 символов' });
    }

    // Находим пользователя
    const user = await User.findByPk(userId); // Строка 10
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем старый пароль
    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(403).json({ message: 'Неверный текущий пароль' });
    }

    // Устанавливаем новый пароль
    await user.setPassword(newPassword);
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// exports.sendResetPasswordEmail = async (req, res) => {

//   try {

//     const { email } = req.body;

//     if(!email) {
//       return res.status(400).json({ message: 'Необходимо указать email' });
//     }

//     // Находим пользователя по email
//     const user = await User.findOne({ where: { email }});
//     if(!user) {
//       return res.status(404).json({ message: 'Пользователь с таким email не найден' });
//     }

//     // Генерируем токен восстановления
//     const resetToken = crypto.randomBytes(20).toString('hex');
//     user.sendResetPasswordToken = resetToken;
//     user.sendResetPasswordExpires = Date.now(); + 3600000;
//     await user.save();

//     // Отправляем ссылку восстановления
//     const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
//     await emailService.sendEmail(
//       user.email,
//       'Восстановление пароля',
//       `Для сброса пароля перейдите по ссылке: ${resetUrl}`
//     );

//     res.json({ message: 'Ссылка для восстановления пароля отправлена на ваш email' });

//   } catch(error) {

//     console.error('Ошибка при отправке ссылки восстановления', error);
//     res.status(500).json({ message: 'Ошибка сервера' });

//   };

// };

exports.generateResetCode = async (req, res) => {

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Необходимо указать email' });
    }

    // Находим пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    // Генерируем код восстановления
    const resetCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 4-символьный код
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 3600000; // Код действителен 1 час
    await user.save();

    // Возвращаем код пользователю (можно показать на экране)
    res.json({ message: 'Код восстановления успешно сгенерирован', resetCode });
  } catch (error) {
    console.error('Ошибка при генерации кода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }

};

exports.verifyResetCode = async (req,res) => {

  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Необходимо указать email, resetCode и newPassword' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен быть минимум 6 символов' });
    }

    const user = await User.findOne({
      where: {
        email,
        resetCode,
        resetCodeExpires: { [Op.gt]: Date.now() }, // Проверяем, что код еще действителен
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Код восстановления недействителен или истек' });
    }

    // Сбрасываем пароль
    await user.setPassword(newPassword);
    user.resetCode = null; // Очищаем код после использования
    user.resetCodeExpires = null;
    await user.save();

    // Генерируем новый токен
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Строка 200

    res.json({ message: 'Пароль успешно сброшен', token });
  } catch (error) {
    console.error('Ошибка при проверке кода:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }

};

exports.resetPassword = async (req, res) => {

  try {

    const { token, newPassword } = req.body;

    if(!token || !newPassword) {
      return res.status(400).json({ message: 'Необходимо указать token и newPassword' }); 
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен быть минимум 6 символов' });
    }

    // Находим пользователя по токену восстановления
    const user = await User.findOne({
      where: {
        sendResetPasswordToken: token,
        sendResetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Токен восстановления недействителен или истек' });
    }

    // Устанавливаем новый пароль
    await user.setPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Пароль успешно сброшен' });

  } catch(error) {

    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });

  }

};