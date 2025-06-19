/**
 * Migration for creating categoryTable
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('categoryTable', {
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

    // Seed categories
    await queryInterface.bulkInsert('categoryTable', [
      { name: 'JavaScript' },
      { name: 'Python' },
      { name: 'Java' },
      { name: 'HTML' },
      { name: 'CSS' },
      { name: 'SQL' },
      { name: 'Node.js' },
      { name: 'React' },
      { name: 'DevOps' },
      { name: 'Cybersecurity' },
      { name: 'Others' },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('categoryTable');
  },
};