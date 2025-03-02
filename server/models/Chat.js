const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {}

  Chat.init(
    {
      type: {
        type: DataTypes.ENUM('private', 'group'),
        defaultValue: 'private',
      },
      adminId: { // Строка 10: добавляем adminId
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      Chat.belongsToMany(models.User, { // Строка 15
        through: 'ChatParticipants',
        as: 'participants',
        foreignKey: 'chatId',
        otherKey: 'userId',
      });
    }
  };

  return Chat;
};