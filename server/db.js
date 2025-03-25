const { Sequelize, DataTypes } = require('sequelize');
const Chat = require('./models/chat'); // Импорт модели Chat
const User = require('./models/user'); // Импорт модели User
const ChatParticipant = require('./models/chatParticipant'); // Импорт модели ChatParticipant
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

// Инициализация моделей
const chatModel = Chat(sequelize, Sequelize.DataTypes);
const userModel = User(sequelize, Sequelize.DataTypes);
const chatParticipantModel = ChatParticipant(sequelize, Sequelize.DataTypes);

// Настройка связей между моделями
chatModel.belongsToMany(userModel, {
  through: chatParticipantModel,
  as: 'participants',
  foreignKey: 'chatId',
});
userModel.belongsToMany(chatModel, {
  through: chatParticipantModel,
  as: 'chats',
  foreignKey: 'userId',
});

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

module.exports = 
  {
  Chat: chatModel,
  User: userModel,
  ChatParticipant: chatParticipantModel,
  sequelize,
  db,
};
