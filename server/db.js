const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Инициализация Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

// Загрузка моделей
const models = require('./models');

// Добавляем sequelize и Sequelize в объект models
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = {
  sequelize,
  User: require('./models/User')(sequelize, DataTypes),
  Chat: require('./models/Chat')(sequelize, DataTypes),
  Message: require('./models/Message')(sequelize, DataTypes),
  ForwardedMessages: require('./models/ForwardedMessages')(sequelize, DataTypes), // Строка 10
};