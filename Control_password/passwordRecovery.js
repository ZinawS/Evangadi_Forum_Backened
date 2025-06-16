import dbConnection from "../Database/database_config.js";
import crypto from "crypto";
import { sendResetEmail } from "../sendEmail.js"; // Helper function that sends email
import bcrypt from "bcrypt";
import dotenv from "dotenv";
// Helper function to generate a secure random token
function generateToken() {
  return crypto.randomBytes(32).toString("hex"); // 64-character hexadecimal token
}

// Main controller for handling forgot password requests
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Step 1: Input validation
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Step 2: Look up the user in the database
    const [users] = await dbConnection
      .promise()
      .execute("SELECT * FROM usertable WHERE email = ?", [email]);

    if (users.length === 0) {
      // Avoid leaking existence of emails
      return res
        .status(200)
        .json({ message: "If this email exists, a reset link has been sent." });
    }

    // Step 3: Generate secure token and expiry (1 hour from now)
    const token = generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
   
    // Step 4: Store token and expiry in the user's record
    await dbConnection
      .promise()
      .execute(
        "UPDATE usertable SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
        [token, expiry, email]
      );

    // Step 5: Send the password reset email
    await sendResetEmail(email, token); // This function handles formatting and sending

    // Step 6: Respond to the client
    res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
};

// Step 2: Handle password reset
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Validate input
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required." });
    }

    // 2. Lookup the user with the token and check token expiry
    const [users] = await dbConnection
      .promise()
      .execute(
        "SELECT * FROM usertable WHERE reset_token = ? AND reset_token_expiry > NOW()",
        [token]
      );
 
    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    const user = users[0];

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password and clear the reset token fields
    await dbConnection.promise().execute(
      `UPDATE usertable 
         SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
         WHERE userid = ?`,
      [hashedPassword, user.userid]
    );

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
