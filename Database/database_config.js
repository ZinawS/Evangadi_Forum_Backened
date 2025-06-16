import pg from "pg";
import dotenv from "dotenv";

// Initialize environment variables from .env file
dotenv.config();

/**
 * PostgreSQL connection pool configuration.
 * Uses environment variables for host, user, password, database, and port.
 * Includes production-ready pool settings similar to the MySQL version.
 */
const { Pool } = pg;

const dbConnection = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "evangadi_forum",
  port: process.env.DB_PORT || 5432, // PostgreSQL default port

  // Connection pool settings (similar to MySQL version)
  max: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10, // Max concurrent connections
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

/**
 * Test database connection on startup.
 * Executes a simple query to verify connectivity and logs the result.
 */
dbConnection.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("Database connection test failed:", err.message);
  } else {
    console.log(
      "Database connection test successful. Current server time:",
      result.rows[0].now
    );
  }
});

/**
 * Event listener for connection pool errors.
 * Logs errors to help diagnose issues in production.
 */
dbConnection.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

export default dbConnection;
/**
 * Database schema for reference (not executed here; run separately via database.sql).
 * Included as a comment to document the expected database structure.
 */
/*
-- Create the database
CREATE DATABASE IF NOT EXISTS evangadi_forum;

-- Use the database
USE evangadi_forum;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS userTable (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    firstname VARCHAR(20) NOT NULL,
    lastname VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE userTable
ADD COLUMN reset_token TEXT,
ADD COLUMN reset_token_expiry BIGINT;

-- QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questionTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionid VARCHAR(100) NOT NULL UNIQUE,
    userid INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tag TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES userTable(userid) ON DELETE CASCADE
);

-- ANSWERS TABLE
CREATE TABLE IF NOT EXISTS answerTable (
    answerid INT AUTO_INCREMENT PRIMARY KEY,
    questionid VARCHAR(100) NOT NULL,
    userid INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (questionid) REFERENCES questionTable(questionid) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES userTable(userid) ON DELETE CASCADE
);
*/
