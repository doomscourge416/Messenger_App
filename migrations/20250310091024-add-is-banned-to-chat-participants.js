module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ChatParticipants', 'isBanned', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('ChatParticipants', 'isBanned');
  },
};