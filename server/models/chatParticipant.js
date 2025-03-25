module.exports = (sequelize, DataTypes) => {
    const ChatParticipant = sequelize.define(
      'ChatParticipant',
      {
        chatId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        isBanned: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        tableName: 'ChatParticipants', // Указываем имя таблицы в БД
        timestamps: true, // Включаем автоматическое создание полей createdAt и updatedAt
      }
    );
  
    return ChatParticipant;
  };