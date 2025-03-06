module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('BlacklistedTokens', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        token: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
    },
    down: async (queryInterface) => {
      await queryInterface.dropTable('BlacklistedTokens');
    },
  };