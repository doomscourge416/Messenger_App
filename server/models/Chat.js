const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {}

  Chat.init(
    {
      type: {
        type: DataTypes.ENUM('private', 'group'),
        defaultValue: 'private',
      },
      adminId: {
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
      tableName: 'Chats',
      freezeTableName: true,
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
        otherKey: 'userId',
      });
    }
  };

  return Chat;
};