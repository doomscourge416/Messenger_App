const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Инициализация Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

// Создаем объект db
const db = {
  sequelize,
  Sequelize,
};

// Загрузка моделей через models/index.js
const models = require('./models/index'); // Импортируем объект моделей

// Добавляем модели в объект db
Object.keys(models).forEach((modelName) => {
  db[modelName] = models[modelName];
});

// Подключаем модель BlacklistedToken
try {
  const BlacklistedToken = require('./models/BlacklistedToken')(db.sequelize, db.Sequelize.DataTypes);
  db.BlacklistedToken = BlacklistedToken;
} catch (error) {
  console.error('Ошибка при загрузке модели BlacklistedToken:', error.message);
}

module.exports = db;