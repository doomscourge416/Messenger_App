// models/BlacklistedToken.js
module.exports = (sequelize, DataTypes) => {
  const BlacklistedToken = sequelize.define(
    'BlacklistedToken',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'BlacklistedTokens', // Убедитесь, что имя таблицы соответствует вашей базе данных
      timestamps: true,
    }
  );

  return BlacklistedToken;
};