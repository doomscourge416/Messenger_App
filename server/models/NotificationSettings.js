const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationSettings extends Model {}

  NotificationSettings.init(
    {
      isMuted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'NotificationSettings',
    }
  );

  NotificationSettings.associate = function (models) {
    if (models.User) {
      NotificationSettings.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }

    if (models.Chat) {
      NotificationSettings.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    }
  };

  return NotificationSettings;
};