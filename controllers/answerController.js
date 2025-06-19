// controllers/answerController.js
import { Answer, User, Question, Rating } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";

export const getAnswers = async (req, res) => {
  try {
    const { questionid } = req.params; // Updated to questionid
    const userId = req.user?.userid;

    // Validate questionid
    if (!questionid) {
      return sendResponse(res, 400, {
        success: false,
        error: "Question ID is required",
      });
    }

    // Validate question exists
    const question = await Question.findOne({ where: { questionid } }); // Updated to questionid
    if (!question) {
      return sendResponse(res, 404, {
        success: false,
        error: "Question not found",
      });
    }

    // Fetch answers with associated user and rating data
    const answers = await Answer.findAll({
      where: { questionid }, // Updated to questionid
      include: [
        {
          model: User,
          attributes: ["username"],
          as: "User",
        },
        {
          model: Rating,
          as: "Ratings",
          attributes: ["rating"],
          include: [
            {
              model: User,
              attributes: ["userid"],
              as: "Rater",
            },
          ],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    // Process answer data with rating calculations
    const formattedAnswers = answers.map((answer) => {
      const ratings = answer.Ratings || [];
      const userRating =
        ratings.find((r) => r.Rater?.userid === userId)?.rating || 0;
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      return {
        answerid: answer.answerid,
        questionid: answer.questionid, // Updated to questionid
        userid: answer.userid,
        username: answer.User?.username,
        answer: answer.answer,
        created_at: answer.created_at,
        userRating,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingCount: ratings.length,
      };
    });

    sendResponse(res, 200, {
      success: true,
      answers: formattedAnswers,
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    sendResponse(res, 500, {
      success: false,
      error: "Failed to fetch answers",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const createAnswer = async (req, res) => {
  try {
    const { questionid, answer } = req.body; // Updated to questionid
    const { userid } = req.user;

    // Validate required fields
    if (!answer || !questionid) {
      return sendResponse(res, 400, {
        success: false,
        error: "Answer content and question ID are required",
      });
    }

    // Verify question exists
    const question = await Question.findOne({ where: { questionid } }); // Updated to questionid
    if (!question) {
      return sendResponse(res, 404, {
        success: false,
        error: "Question not found",
      });
    }

    // Create new answer
    const newAnswer = await Answer.create({
      questionid, // Updated to questionid
      userid,
      answer,
    });

    sendResponse(res, 201, {
      success: true,
      message: "Answer created successfully",
      answer: {
        answerid: newAnswer.answerid,
        questionid: newAnswer.questionid, // Updated to questionid
        userid: newAnswer.userid,
        answer: newAnswer.answer,
        created_at: newAnswer.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    sendResponse(res, 500, {
      success: false,
      error: "Failed to create answer",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
