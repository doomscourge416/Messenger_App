const { User } = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');
const db = require('../db');

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
    console.error('Ошибка при входе:', error.response?.data || error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Получаем токен из заголовка

    if (!token) {
      return res.status(400).json({ message: 'Токен не предоставлен' });
    }

    // Добавляем токен в черный список
    await db.BlacklistedToken.create({ token });

    return res.status(200).json({ message: 'Вы успешно вышли из системы' });
  } catch (error) {
    console.error('Ошибка при выходе:', error.message);
    return res.status(500).json({ message: 'Ошибка сервера' });
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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    // Генерируем код восстановления
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-символьный код
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 3600000; // Код действителен 1 час
    await user.save();

    res.json({ message: 'Код восстановления отправлен', resetCode });
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
    const { resetCode, newPassword } = req.body;

    // Проверяем входные данные
    if (!resetCode || !newPassword) {
      return res.status(400).json({ message: 'Необходимо указать код восстановления и новый пароль' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен быть минимум 6 символов' });
    }

    // Находим пользователя по коду восстановления
    const user = await User.findOne({
      where: {
        resetCode,
        resetCodeExpires: { [Op.gt]: Date.now() }, // Проверяем, что код действителен
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Неверный или истекший код восстановления' });
    }

    // Устанавливаем новый пароль
    await user.setPassword(newPassword);

    // Очищаем код восстановления
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};