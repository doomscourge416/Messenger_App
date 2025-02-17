'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Добавьте этот импорт

function generateVerificationToken() {
  return crypto.randomBytes(20).toString('hex');
}

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      nickname: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isEmailVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users', // Укажите явное имя таблицы
      freezeTableName: true, // Запретить автоматическое множественное число
    }
  );

  User.associate = function (models) {
    if (models.Message) {
      User.hasMany(models.Message, { foreignKey: 'senderId', as: 'messages' });
    }

    if (models.Contact) {
      User.belongsToMany(models.User, {
        through: models.Contact,
        as: 'contacts',
        foreignKey: 'userId',
        otherKey: 'contactId',
      });
    }

    if (models.Chat) {
      User.belongsToMany(models.Chat, {
        through: 'ChatParticipants',
        as: 'chats',
        foreignKey: 'userId',
        otherKey: 'chatId',
      });
    }
  };

  User.prototype.setPassword = async function (password) {
    this.password = await bcrypt.hash(password, 10);
  };

  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.generateVerificationToken = generateVerificationToken;

  return User;
};