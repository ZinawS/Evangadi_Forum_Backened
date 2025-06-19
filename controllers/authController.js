/**
 * Authentication controller
 * Handles user registration, login, and password reset
 */
import bcrypt from "bcrypt";
import { makeToken } from "../utils/jwt.js";
import { User } from "../models/index.js";
import { sendResetEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { sendResponse } from "../utils/responseHandler.js";
import { Op } from "sequelize";

/**
 * Check authenticated user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const checkUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { userid: req.user.userid },
      attributes: ["userid", "username", "firstName", "lastName", "email"],
    });
    if (!user) {
      return sendResponse(res, 404, { error: "User not found" });
    }
    sendResponse(res, 200, user);
  } catch (error) {
    console.error("Check user error:", error);
    sendResponse(res, 500, { error: "Failed to fetch user data" });
  }
};

/**
 * Register new user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const register = async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;

    const existingUser = await User.findOne({
      where: { username, email },
    });
    if (existingUser?.username === username) {
      return sendResponse(res, 400, { error: "Username already taken" });
    }
    if (existingUser?.email === email) {
      return sendResponse(res, 400, { error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      firstname,
      lastname,
      password: hashedPassword,
    });

    sendResponse(res, 201, { message: "Registration successful!" });
  } catch (error) {
    console.error("Registration error:", error);
    sendResponse(res, 500, {
      error: "Registration failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Login user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendResponse(res, 401, { error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, { error: "Invalid email or password" });
    }

    const token = makeToken({ userid: user.userid, email: user.email });
    sendResponse(res, 200, {
      token,
      user: {
        userid: user.userid,
        firstname: user.firstname,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse(res, 500, { error: "Login failed" });
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendResponse(res, 404, { error: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await User.update(
      { reset_token: resetToken, reset_token_expiry: resetTokenExpiry },
      { where: { email } }
    );

    await sendResetEmail(email, resetToken);
    sendResponse(res, 200, { message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    sendResponse(res, 500, { error: "Failed to send reset email" });
  }
};

/**
 * Reset password
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
/**
 * Reset password
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    let password = newPassword;
    console.log("Reset password request:", { token, password });
    // Validate password exists
    if (!password) {
      return sendResponse(res, 400, {
        error: "Password is required",
      });
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return sendResponse(res, 400, {
        error: "Invalid or expired reset token",
      });
    }

    // Validate password is not empty
    if (typeof password !== "string" || password.trim().length === 0) {
      return sendResponse(res, 400, {
        error: "Password cannot be empty",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update(
      {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
      { where: { reset_token: token } }
    );

    sendResponse(res, 200, { message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    sendResponse(res, 500, {
      error: "Failed to reset password",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
