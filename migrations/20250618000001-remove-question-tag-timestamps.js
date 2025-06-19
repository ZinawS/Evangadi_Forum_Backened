module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn("QuestionTag", "createdAt");
    await queryInterface.removeColumn("QuestionTag", "updatedAt");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("QuestionTag", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.addColumn("QuestionTag", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },
};
