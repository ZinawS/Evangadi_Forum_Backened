/**
 * Rating controller
 * Handles rating operations for answers with owner validation
 */
import { Rating, Answer, User} from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";
import sequelize from "../config/database.js";

/**
 * Submit or update a rating for an answer
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const submitRating = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { answerId, rating } = req.body;
    const { userid } = req.user;

    // Validate input
    if (!answerId || rating == null || rating < 0 || rating > 5) {
      await transaction.rollback();
      return sendResponse(res, 400, {
        success: false,
        error: "Invalid answer ID or rating value (must be between 0-5)",
      });
    }

    // Check if rating is a valid number (integer or .5 increment)
    if (rating % 0.5 !== 0) {
      await transaction.rollback();
      return sendResponse(res, 400, {
        success: false,
        error: "Rating must be in 0.5 increments (0, 0.5, 1, 1.5, etc.)",
      });
    }

    // Find answer with owner information
    const answer = await Answer.findOne({
      where: { answerid: answerId },
      include: [
        {
          model: User,
          attributes: ["userid"],
          as: "User",
        },
      ],
      transaction,
    });

    if (!answer) {
      await transaction.rollback();
      return sendResponse(res, 404, {
        success: false,
        error: "Answer not found",
      });
    }

    // Prevent owner from rating their own answer
    if (answer.userid === userid) {
      await transaction.rollback();
      return sendResponse(res, 403, {
        success: false,
        error: "You cannot rate your own answer",
      });
    }

    // Find or create rating - using the correct column names from your model
    const [ratingRecord, created] = await Rating.findOrCreate({
      where: {
        answerId: answerId,
        userId: userid,
      },
      defaults: {
        rating,
        answerId,
        userId: userid,
      },
      transaction,
    });

    // Update existing rating if not created
    if (!created) {
      await ratingRecord.update({ rating }, { transaction });
    }

    // Calculate new average rating
    const allRatings = await Rating.findAll({
      where: { answerId: answerId },
      attributes: ["rating"],
      transaction,
    });

    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

    await transaction.commit();

    sendResponse(res, 200, {
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingCount: allRatings.length,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Submit rating error:", error);
    sendResponse(res, 500, {
      success: false,
      error: "Failed to submit rating",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user's rating for an answer
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getUserRating = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { userid } = req.user;

    if (!answerId) {
      return sendResponse(res, 400, {
        success: false,
        error: "Answer ID is required",
      });
    }

    const rating = await Rating.findOne({
      where: {
        answerId: answerId,
        userId: userid,
      },
      attributes: ["rating"],
    });

    sendResponse(res, 200, {
      success: true,
      rating: rating?.rating || 0,
    });
  } catch (error) {
    console.error("Get user rating error:", error);
    sendResponse(res, 500, {
      success: false,
      error: "Failed to get user rating",
    });
  }
};
