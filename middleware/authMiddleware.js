/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/responseHandler.js";

/**
 * Check if user is authenticated
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export const checkLogin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return sendResponse(res, 401, { error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    sendResponse(res, 401, { error: "Invalid or expired token" });
  }
};
