'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {}

  Chat.init(
    {
      type: {
        type: DataTypes.ENUM('private', 'group'),
        defaultValue: 'private',
      },
    },
    {
      sequelize,
      modelName: 'Chat',
    }
  );

  Chat.associate = function (models) {
    if (models.Message) {
      Chat.hasMany(models.Message, { foreignKey: 'chatId', as: 'messages' });
    }

    if (models.User) {
      Chat.belongsToMany(models.User, {
        through: 'ChatParticipants',
        as: 'participants',
        foreignKey: 'chatId',
      });
    }
  };

  return Chat;
};