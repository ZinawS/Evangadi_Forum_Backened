import { Question, Answer, Tag, User } from "../models/index.js";
import { sendResponse } from "../utils/responseHandler.js";
import sequelize from "../config/database.js";

export const updateContent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { type, title, description, answer, tags } = req.body;

    console.log("updateContent: Received tags:", tags);

    if (type === "question") {
      const question = await Question.findOne({
        where: { questionid: id },
        include: [
          {
            model: Tag,
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
          {
            model: User,
            attributes: ["userid", "username"],
          },
        ],
        transaction,
      });

      if (!question) {
        await transaction.rollback();
        return sendResponse(res, 404, { error: "Question not found" });
      }

      await question.update(
        {
          title: title || question.title,
          description: description || question.description,
        },
        { transaction }
      );

      if (tags && Array.isArray(tags) && tags.length > 0) {
        const tagInstances = await Promise.all(
          tags.map(async (tagName) => {
            const trimmedTag = tagName.trim();
            if (!trimmedTag) return null;
            try {
              const [tag, created] = await Tag.findOrCreate({
                where: { name: trimmedTag },
                defaults: { name: trimmedTag },
                transaction,
              });
              console.log(
                `Tag ${trimmedTag}: ${created ? "created" : "found"}`
              );
              return tag;
            } catch (err) {
              console.error(`Error processing tag ${trimmedTag}:`, err);
              throw err;
            }
          })
        );
        const validTags = tagInstances.filter((tag) => tag !== null);
        await question.setTags(validTags, { transaction });
        const questionTags = await sequelize.models.QuestionTag.findAll({
          where: { questionId: question.id },
        });
        console.log(
          "QuestionTag entries after setTags:",
          questionTags.map((qt) => qt.toJSON())
        );
      } else {
        console.log(
          "updateContent: No tags provided or empty array, skipping setTags"
        );
      }

      const updatedQuestion = await Question.findOne({
        where: { questionid: id },
        include: [
          {
            model: Tag,
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
          {
            model: User,
            attributes: ["userid", "username"],
          },
        ],
        attributes: [
          "id",
          "questionid",
          "title",
          "description",
          "created_at",
          "updated_at",
        ],
        transaction,
      });

      console.log("Updated question:", updatedQuestion?.get({ plain: true }));
      console.log(
        "Updated tags:",
        updatedQuestion?.Tags?.map((tag) => tag.name) || []
      );

      await transaction.commit();

      const responseQuestion = {
        id: updatedQuestion.id,
        questionid: updatedQuestion.questionid,
        userid: updatedQuestion.User.userid,
        username: updatedQuestion.User.username,
        title: updatedQuestion.title,
        description: updatedQuestion.description,
        created_at: updatedQuestion.created_at,
        updated_at: updatedQuestion.updated_at,
        tags: updatedQuestion.Tags?.map((tag) => tag.name) || [],
      };

      return sendResponse(res, 200, {
        success: true,
        question: responseQuestion,
        message: "Question updated successfully",
      });
    } else if (type === "answer") {
      const answerRecord = await Answer.findOne({
        where: { answerid: id },
        transaction,
      });

      if (!answerRecord) {
        await transaction.rollback();
        return sendResponse(res, 404, { error: "Answer not found" });
      }

      await answerRecord.update({ answer }, { transaction });
      await transaction.commit();

      return sendResponse(res, 200, {
        success: true,
        message: "Answer updated successfully",
      });
    } else {
      await transaction.rollback();
      return sendResponse(res, 400, { error: "Invalid content type" });
    }
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error(`Update content error for ${type} ID ${id}:`, error);
    return sendResponse(res, 500, {
      error: "Failed to update content",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
};

export const deleteContent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!type || !["question", "answer"].includes(type)) {
      await transaction.rollback();
      return sendResponse(res, 400, { error: "Invalid content type" });
    }

    if (type === "question") {
      const question = await Question.findOne({
        where: { questionid: id },
        transaction,
      });

      if (!question) {
        await transaction.rollback();
        return sendResponse(res, 404, { error: "Question not found" });
      }

      await question.setTags([], { transaction });
      await question.destroy({ transaction });
    } else if (type === "answer") {
      const result = await Answer.destroy({
        where: { answerid: id },
        transaction,
      });

      if (result === 0) {
        await transaction.rollback();
        return sendResponse(res, 404, { error: "Answer not found" });
      }
    }

    await transaction.commit();
    return sendResponse(res, 200, {
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Delete content error:", error);

    const errorResponse = {
      error: "Failed to delete content",
      ...(process.env.NODE_ENV === "development" && {
        details: error.message,
      }),
    };

    return sendResponse(res, 500, errorResponse);
  }
};
