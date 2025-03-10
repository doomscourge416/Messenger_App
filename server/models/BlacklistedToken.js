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
        unique: false, // Убираем уникальность
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
      tableName: 'BlacklistedTokens',
      timestamps: true,
    }
  );

  return BlacklistedToken;
};