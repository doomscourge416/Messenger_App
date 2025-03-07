const jwt = require('jsonwebtoken');
const db = require('../db'); // Убедитесь, что путь к db.js правильный

// Функция для проверки, находится ли токен в черном списке
const isTokenBlacklisted = async (token) => {
  try {
    const blacklistedToken = await db.BlacklistedToken.findOne({ where: { token } });
    return !!blacklistedToken;
  } catch (error) {
    console.error('Ошибка при проверке черного списка:', error);
    return false; // Если произошла ошибка, считаем токен действительным
  }
};

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Необходима авторизация' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Токен отсутствует' });
    }

    // Проверяем, находится ли токен в черном списке
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(403).json({ message: 'Токен недействителен (в черном списке)' });
    }

    // Проверяем и декодируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    // Передаем управление дальше
    next();
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return res.status(403).json({ message: 'Недействительный токен' });
  }
};