/**
 * Migration for creating tagTable
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tagTable', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tagTable');
  },
};