/**
 * Sequelize database configuration for MySQL
 * Supports connection pooling and environment-based configuration
 */
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize Sequelize with MySQL configuration
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    dialectOptions: {
      socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    },
    // Remove host and port when using socket
    pool: {
      max: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

/**
 * Test database connection
 */
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch((err) => {
    console.error("Database connection test failed:", err.message);
  });

export default sequelize;
