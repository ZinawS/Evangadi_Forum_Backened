/**
 * Response utility for consistent API responses
 */

/**
 * Send standardized JSON response
 * @param {Object} res - Express response
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 */
export const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    status: statusCode >= 200 && statusCode < 300 ? "success" : "error",
    ...data,
  });
};
