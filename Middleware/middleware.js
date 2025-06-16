import {tokenVerfier} from "../TokenGenerator/JWT.js";
import dbConnection from "../Database/database_config.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const checkLogin = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Please log in" });
    }

    // Verify token
    const decoded = tokenVerfier(token, process.env.JWT_SECRET);

    // Check if user exists using prepared statement
    const [users] = await dbConnection
      .promise()
      .execute("SELECT userid FROM userTable WHERE userid = ?", [
        decoded.userid,
      ]);

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = { userid: decoded.userid };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired login" });
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

    next();
  } catch (error) {
    console.error("Signup validation error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during validation" });
  }
};

export { checkLogin, checkSignUp };
