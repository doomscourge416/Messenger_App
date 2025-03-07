const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationSettings extends Model {}

  NotificationSettings.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Поле не может быть NULL
        references: {
          model: 'Users', // Ссылается на таблицу Users
          key: 'id',
        },
        onDelete: 'CASCADE', // При удалении пользователя удаляются его настройки
        onUpdate: 'CASCADE',
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Поле не может быть NULL
        references: {
          model: 'Chats', // Ссылается на таблицу Chats
          key: 'id',
        },
        onDelete: 'CASCADE', // При удалении чата удаляются связанные настройки
        onUpdate: 'CASCADE',
      },
      isMuted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // По умолчанию уведомления включены
      },
    },
    {
      sequelize,
      modelName: 'NotificationSettings',
      tableName: 'NotificationSettings', // Явное имя таблицы
      indexes: [
        {
          unique: true,
          fields: ['userId', 'chatId'], // Составной уникальный индекс
        },
      ],
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