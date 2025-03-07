module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('NotificationSettings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      chatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      isMuted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Добавляем составной уникальный индекс
    await queryInterface.addIndex('NotificationSettings', ['userId', 'chatId'], {
      unique: true,
      name: 'unique_user_chat',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('NotificationSettings');
  },
};