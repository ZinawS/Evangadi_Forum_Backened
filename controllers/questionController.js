import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import { Question, User, Tag, Category } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";
import sequelize from "../config/database.js";

export const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    let categoryCondition = {};
    if (category) {
      const categoryRecord = await Category.findOne({
        where: { name: category },
      });
      if (categoryRecord) {
        categoryCondition = { categoryId: categoryRecord.id };
      } else {
        return sendResponse(res, 200, { questions: [], totalPages: 0 });
      }
    }

    const { count, rows } = await Question.findAndCountAll({
      where: { ...where, ...categoryCondition },
      include: [
        { model: User, attributes: ["username"] },
        { model: Tag, through: { attributes: [] }, attributes: ["name"] },
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
      updated_at: q.updated_at,
      tags: q.Tags.map((tag) => tag.name),
    }));

    const totalPages = Math.ceil(count / parseInt(limit));
    sendResponse(res, 200, { questions, totalPages });
  } catch (error) {
    console.error("Get questions error:", error);
    sendResponse(res, 500, { error: "Failed to fetch questions" });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { questionid } = req.params;
    const question = await Question.findOne({
      where: { questionid },
      include: [
        { model: User, attributes: ["userid", "username"] },
        { model: Tag, through: { attributes: [] }, attributes: ["name"] },
        { model: Category, attributes: ["name"] },
      ],
    });

    if (!question) {
      return sendResponse(res, 404, { error: "Question not found" });
    }

    sendResponse(res, 200, {
      id: question.id,
      questionid: question.questionid,
      userid: question.User.userid,
      username: question.User.username,
      title: question.title,
      description: question.description,
      created_at: question.created_at,
      updated_at: question.updated_at,
      tags: question.Tags.map((tag) => tag.name),
      category: question.Category.name,
    });
  } catch (error) {
    console.error("Get question error:", error);
    sendResponse(res, 500, {
      error: "Failed to fetch question",
      details: error.message,
    });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const { userid } = req.user;

    if (!title?.trim() || !description?.trim() || !category) {
      return sendResponse(res, 400, {
        error: "Title, description, and category are required",
      });
    }

    if (
      tags &&
      (!Array.isArray(tags) || tags.some((t) => !t?.trim() || t.length > 50))
    ) {
      return sendResponse(res, 400, {
        error:
          "Tags must be an array of non-empty strings, max 50 characters each",
      });
    }

    const categoryRecord = await Category.findOne({
      where: { name: category.trim() },
    });
    if (!categoryRecord) {
      return sendResponse(res, 400, { error: "Invalid category" });
    }

    const questionid = uuidv4();
    const question = await Question.create({
      questionid,
      userid,
      categoryId: categoryRecord.id,
      title: title.trim(),
      description: description.trim(),
    });

    let tagRecords = [];
    if (tags && tags.length > 0) {
      tagRecords = await Promise.all(
        tags.map(async (tagName) => {
          const trimmedTag = tagName.trim();
          console.log(`Processing tag: ${trimmedTag}`);
          const [tag, created] = await Tag.findOrCreate({
            where: { name: trimmedTag },
            defaults: { name: trimmedTag },
          });
          console.log(`Tag ${trimmedTag}: ${created ? "created" : "found"}`);
          return tag;
        })
      );
      await question.setTags(tagRecords);
      console.log(
        `Associated ${tagRecords.length} tags with question ${questionid}`
      );
      // Verify QuestionTag entries
      const questionTags = await sequelize.models.QuestionTag.findAll({
        where: { questionId: question.id },
      });
      console.log(
        "QuestionTag entries:",
        questionTags.map((qt) => qt.toJSON())
      );
    }

    sendResponse(res, 201, {
      message: "Question created successfully",
      questionid,
      tags: tagRecords.map((tag) => tag.name),
    });
  } catch (error) {
    console.error("Create question error:", error);
    sendResponse(res, 500, {
      error: "Failed to create question",
      details: error.message,
    });
  }
};
