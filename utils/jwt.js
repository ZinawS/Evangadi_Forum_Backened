/**
 * JWT utility functions
 */
import jwt from "jsonwebtoken";

/**
 * Generate JWT token
 * @param {Object} payload - Data to include in token
 * @returns {string} JWT token
 */
export const makeToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};
