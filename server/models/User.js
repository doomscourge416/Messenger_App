'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

function generateVerificationToken() {
  return crypto.randomBytes(20).toString('hex');
}

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isEmailVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
      },
      resetCode: {
        type: DataTypes.STRING,
      },
      resetCodeExpires: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      freezeTableName: true,
      indexes: [],
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