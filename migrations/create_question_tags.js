/**
 * Migration for creating QuestionTag junction table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuestionTag", {
      questionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "questionTable",
          key: "id",
        },
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tagTable",
          key: "id",
        },
      },
    });

    // Add unique constraint for questionId and tagId
    await queryInterface.addConstraint("QuestionTag", {
      fields: ["questionId", "tagId"],
      type: "unique",
      name: "unique_question_tag",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("QuestionTag");
  },
};
