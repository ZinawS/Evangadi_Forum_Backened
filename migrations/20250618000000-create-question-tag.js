// migration file, e.g., 20250618120000-create-question-tag.js
"use strict";

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
        onDelete: "CASCADE",
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tagTable",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("QuestionTag");
  },
};
