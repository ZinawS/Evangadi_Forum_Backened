/**
 * Search controller
 * Handles search operations for questions
 */
import { Op } from "sequelize";
import { Question, User, Tag, Category } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";

/**
 * Search questions by title, description, or tags
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const searchQuestions = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!query) {
      return sendResponse(res, 400, { error: "Search query is required" });
    }

    const { count, rows } = await Question.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: User, attributes: ["username"] },
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ["name"],
          where: { name: { [Op.iLike]: `%${query}%` } },
          required: false,
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [["created_at", "DESC"]],
    });

    const questions = rows.map((q) => ({
      id: q.id,
      questionid: q.questionid,
      title: q.title,
      description: q.description,
      username: q.User?.username,
      created_at: q.created_at,
      tags: q.Tags.map((tag) => tag.name),
    }));

    const totalPages = Math.ceil(count / parseInt(limit));
    sendResponse(res, 200, { questions, totalPages });
  } catch (error) {
    console.error("Search questions error:", error);
    sendResponse(res, 500, { error: "Failed to search questions" });
  }
};
