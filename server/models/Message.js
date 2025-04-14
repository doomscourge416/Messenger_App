'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {}

  Message.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      senderId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      chatId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Chats',
          key: 'id',
        },
      },
      isRead: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'Messages',
    }
  );

  Message.associate = function (models) {
    if (models.User) {
      Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    }

    if (models.Chat) {
      Message.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    }
  };

  return Message;
};