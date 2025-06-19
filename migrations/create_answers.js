/**
 * Migration for creating answerTable
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("answerTable", {
      answerid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      questionid: {
        type: Sequelize.STRING(100),
        allowNull: false,
        references: {
          model: "questionTable",
          key: "questionid",
        },
      },
      userid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "userTable",
          key: "userid",
        },
      },
      answer: {
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
    await queryInterface.dropTable("answerTable");
  },
};
