/**
 * Migration for creating userTable
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("userTable", {
      userid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      firstname: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      lastname: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      reset_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reset_token_expiry: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("userTable");
  },
};
