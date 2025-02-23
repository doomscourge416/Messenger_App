'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем поле adminId в таблицу Chats
    await queryInterface.addColumn('Chats', 'adminId', { // Строка 5
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем поле adminId из таблицы Chats
    await queryInterface.removeColumn('Chats', 'adminId'); // Строка 15
  },
};