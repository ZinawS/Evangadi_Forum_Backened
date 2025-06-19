/**
 * Migration for creating questionTable
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("questionTable", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      questionid: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      userid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "userTable",
          key: "userid",
        },
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "categoryTable",
          key: "id",
        },
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("questionTable");
  },
};
