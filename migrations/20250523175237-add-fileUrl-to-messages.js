'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Messages', 'fileUrl', {
      type: Sequelize.STRING,
      allowNull: true, // Разрешаем NULL
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Messages', 'fileUrl');
  },
};
