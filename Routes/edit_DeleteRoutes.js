import express from "express";
import dbConnection from "../Database/database_config.js";
import { checkLogin } from "../Middleware/middleware.js";

const router = express.Router();



router.put("/:id", checkLogin, async (req, res) => {
  const userid = req.user.userid;
  const { id } = req.params;
  const { type, title, description, answer, tag } = req.body;

  console.log(`Edit request received. UserID: ${userid}, ContentID: ${id}, Type: ${type}`);
  console.log("Request body:", req.body);

  try {
    if (type === "question") {
      // Check question ownership
      const [questions] = await dbConnection
        .promise()
        .execute("SELECT userid FROM questionTable WHERE questionid = ?", [id]);
      if (questions.length === 0) {
        console.log("Question not found.");
        return res.status(404).json({ error: "Question not found" });
      }
      if (questions[0].userid !== userid) {
        console.log(`Ownership mismatch: question owner=${questions[0].userid}, request user=${userid}`);
        return res.status(403).json({ error: "You are not authorized to edit this question" });
      }
      console.log("Ownership verified. Updating question...");
      await dbConnection
        .promise()
        .execute(
          "UPDATE questionTable SET title = ?, description = ?, tag = ? WHERE questionid = ?",
          [title, description, tag, id]
        );
      console.log("Question updated successfully.");
      return res.json({ success: true });
    }

    if (type === "answer") {
      // Check answer ownership
      const [answers] = await dbConnection
        .promise()
        .execute("SELECT userid FROM answerTable WHERE answerid = ?", [id]);
      if (answers.length === 0) {
        console.log("Answer not found.");
        return res.status(404).json({ error: "Answer not found" });
      }
      if (answers[0].userid !== userid) {
        console.log(`Ownership mismatch: answer owner=${answers[0].userid}, request user=${userid}`);
        return res.status(403).json({ error: "You are not authorized to edit this answer" });
      }
      console.log("Ownership verified. Updating answer...");
      await dbConnection
        .promise()
        .execute("UPDATE answerTable SET answer = ? WHERE answerid = ?", [answer, id]);
      console.log("Answer updated successfully.");
      return res.json({ success: true });
    }

    console.log("Invalid type specified.");
    return res.status(400).json({ error: "Invalid content type" });
  } catch (error) {
    console.error("Error updating content:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Delete Question or Answer
 * Authenticated endpoint to delete a question or answer owned by the user
 */
router.delete("/:id", checkLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const userid = req.user.userid;

    if (!type || !["question", "answer"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing content type" });
    }

    if (type === "question") {
      const [questions] = await dbConnection
        .promise()
        .execute("SELECT userid FROM questionTable WHERE questionid = ?", [id]);

      if (questions.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }

      if (questions[0].userid !== userid) {
        return res.status(403).json({ error: "Unauthorized to delete this question" });
      }

      await dbConnection
        .promise()
        .execute("DELETE FROM answerTable WHERE questionid = ?", [id]);

      await dbConnection
        .promise()
        .execute("DELETE FROM questionTable WHERE questionid = ?", [id]);

      res.status(200).json({ message: "Question and associated answers deleted successfully" });
    } else {
      const [answers] = await dbConnection
        .promise()
        .execute("SELECT userid FROM answerTable WHERE answerid = ?", [id]);

      if (answers.length === 0) {
        return res.status(404).json({ error: "Answer not found" });
      }

      if (answers[0].userid !== userid) {
        return res.status(403).json({ error: "Unauthorized to delete this answer" });
      }

      await dbConnection
        .promise()
        .execute("DELETE FROM answerTable WHERE answerid = ?", [id]);

      res.status(200).json({ message: "Answer deleted successfully" });
    }
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({ error: "Couldn't delete content" });
  }
});

export default router;
