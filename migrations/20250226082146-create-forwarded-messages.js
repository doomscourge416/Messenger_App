'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ForwardedMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      originalMessageId: {
        type: Sequelize.INTEGER,
        references: { model: 'Messages', key: 'id' },
        onDelete: 'CASCADE',
      },
      forwardedChatId: {
        type: Sequelize.INTEGER,
        references: { model: 'Chats', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ForwardedMessages');
  },
};