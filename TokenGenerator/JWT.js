// ==============================================
// UTILITY FUNCTIONS
// ==============================================
/**
 * JWT Token Generation
 * @param {string} userId - User ID to include in token
 * @returns {string} JWT token
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function makeToken(userId) {
  return jwt.sign({ userid: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}
function tokenVerfier(token, existingToken) {
  return jwt.verify(token, existingToken);
}
export { makeToken, tokenVerfier };
