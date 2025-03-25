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

    // Проверяем, указан ли токен
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Необходима авторизация' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Токен отсутствует' });
    }

    // Проверяем маршрут для банов/разбанов
    const isBanRoute = req.url.includes('/ban-participant') || req.url.includes('/unban-participant');

    if (isBanRoute) {
      // Для банов используем новую логику
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId };
    } else {
      // Для остальных маршрутов используем старую логику
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    res.status(403).json({ message: 'Недействительный токен' });
  }
};