const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Инициализация Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

// Загрузка моделей через models/index.js
const models = require('./models/index'); // Строка 10

module.exports = {
  ...models,
  sequelize,
};