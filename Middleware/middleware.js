import { tokenVerfier } from "../TokenGenerator/JWT.js";
import dbConnection from "../Database/database_config.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const checkLogin = async (req, res, next) => {
  const client = await dbConnection.connect();
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Please log in" });
    }

    // Verify token
    const decoded = tokenVerfier(token, process.env.JWT_SECRET);

    // Check if user exists using parameterized query
    const { rows: users } = await client.query(
      "SELECT userid FROM userTable WHERE userid = $1",
      [decoded.userid]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = { userid: decoded.userid };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ 
      error: "Invalid or expired login",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Registration Request Validator
 * Ensures all required fields are present and valid
 */
const checkSignUp = async (req, res, next) => {
  const { username, firstname, lastname, email, password } = req.body;

  // Required field check
  if (!username || !firstname || !lastname || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Password strength check
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check for existing username/email
    const client = await dbConnection.connect();
    try {
      const { rows: existingUsers } = await client.query(
        `SELECT username, email FROM userTable 
         WHERE username = $1 OR email = $2`,
        [username, email]
      );

      if (existingUsers.some(user => user.username === username)) {
        return res.status(400).json({ error: "Username already taken" });
      }

      if (existingUsers.some(user => user.email === email)) {
        return res.status(400).json({ error: "Email already registered" });
      }

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Signup validation error:", error);
    return res.status(500).json({ 
      error: "Internal server error during validation",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export { checkLogin, checkSignUp };
