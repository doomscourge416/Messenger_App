const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationSettings extends Model {}

  NotificationSettings.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      isMuted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'NotificationSettings',
      tableName: 'NotificationSettings',
      indexes: [], // Убираем уникальные индексы
    }
  );

  NotificationSettings.associate = function (models) {
    if (models.User) {
      NotificationSettings.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }

    if (models.Chat) {
      NotificationSettings.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat',
      });
    }
  };

  return NotificationSettings;
};