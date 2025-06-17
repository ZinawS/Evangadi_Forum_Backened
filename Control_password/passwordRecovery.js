import dbConnection from "../Database/database_config.js";
import crypto from "crypto";
import { sendResetEmail } from "../sendEmail.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Helper function to generate a secure random token
function generateToken() {
  return crypto.randomBytes(32).toString("hex"); // 64-character hexadecimal token
}

// Main controller for handling forgot password requests
export const forgotPassword = async (req, res) => {
  const client = await dbConnection.connect();
  try {
    const { email } = req.body;

    // Step 1: Input validation
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Step 2: Look up the user in the database
    const { rows: users } = await client.query(
      "SELECT * FROM userTable WHERE email = $1",
      [email]
    );

    if (users.length === 0) {
      // Avoid leaking existence of emails
      return res
        .status(200)
        .json({ message: "If this email exists, a reset link has been sent." });
    }

    // Step 3: Generate secure token and expiry (1 hour from now)
    const token = generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour as Date object
   
    // Step 4: Store token and expiry in the user's record
    await client.query(
      "UPDATE userTable SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [token, expiry, email]
    );

    // Step 5: Send the password reset email
    await sendResetEmail(email, token);

    // Step 6: Respond to the client
    res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot Password Error:", {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: "Internal Server Error. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Handle password reset
export const resetPassword = async (req, res) => {
  const client = await dbConnection.connect();
  try {
    await client.query('BEGIN');
    const { token, newPassword } = req.body;

    // 1. Validate input
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required." });
    }

    // 2. Lookup the user with the token and check token expiry
    const { rows: users } = await client.query(
      "SELECT * FROM userTable WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [token]
    );
 
    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    const user = users[0];

    // 3. Hash the new password with validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters"
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password and clear the reset token fields
    await client.query(
      `UPDATE userTable 
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL 
       WHERE userid = $2`,
      [hashedPassword, user.userid]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Reset Password Error:", {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: "Server error. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};
