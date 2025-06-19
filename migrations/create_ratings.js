/**
 * Migration for creating ratingTable
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ratingTable', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      answerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'answerTable',
          key: 'answerid',
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'userTable',
          key: 'userid',
        },
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add unique constraint for answerId and userId
    await queryInterface.addConstraint('ratingTable', {
      fields: ['answerId', 'userId'],
      type: 'unique',
      name: 'unique_answer_user_rating',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ratingTable');
  },
};