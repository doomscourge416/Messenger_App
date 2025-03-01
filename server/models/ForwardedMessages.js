const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ForwardedMessages extends Model {}

  ForwardedMessages.init(
    {
      originalMessageId: {
        type: DataTypes.INTEGER,
        references: { model: 'Messages', key: 'id' },
        onDelete: 'CASCADE',
      },
      forwardedChatId: {
        type: DataTypes.INTEGER,
        references: { model: 'Chats', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'ForwardedMessages',
    }
  );

  ForwardedMessages.associate = function (models) {
    if (models.Message) {
      ForwardedMessages.belongsTo(models.Message, {
        foreignKey: 'originalMessageId',
        as: 'originalMessage',
      });
    }

    if (models.Chat) {
      ForwardedMessages.belongsTo(models.Chat, {
        foreignKey: 'forwardedChatId',
        as: 'forwardedChat',
      });
    }
  };

  return ForwardedMessages;
};