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
    const client = await dbConnection.connect();
    try {
      await client.query('BEGIN');

      if (type === "question") {
        // Check question ownership
        const { rows: questions } = await client.query(
          "SELECT userid FROM questionTable WHERE questionid = $1", 
          [id]
        );
        
        if (questions.length === 0) {
          console.log("Question not found.");
          return res.status(404).json({ error: "Question not found" });
        }
        
        if (questions[0].userid !== userid) {
          console.log(`Ownership mismatch: question owner=${questions[0].userid}, request user=${userid}`);
          return res.status(403).json({ error: "You are not authorized to edit this question" });
        }
        
        console.log("Ownership verified. Updating question...");
        await client.query(
          "UPDATE questionTable SET title = $1, description = $2, tag = $3 WHERE questionid = $4",
          [title, description, tag, id]
        );
        
        console.log("Question updated successfully.");
        await client.query('COMMIT');
        return res.json({ success: true });
      }

      if (type === "answer") {
        // Check answer ownership
        const { rows: answers } = await client.query(
          "SELECT userid FROM answerTable WHERE answerid = $1", 
          [id]
        );
        
        if (answers.length === 0) {
          console.log("Answer not found.");
          return res.status(404).json({ error: "Answer not found" });
        }
        
        if (answers[0].userid !== userid) {
          console.log(`Ownership mismatch: answer owner=${answers[0].userid}, request user=${userid}`);
          return res.status(403).json({ error: "You are not authorized to edit this answer" });
        }
        
        console.log("Ownership verified. Updating answer...");
        await client.query(
          "UPDATE answerTable SET answer = $1 WHERE answerid = $2",
          [answer, id]
        );
        
        console.log("Answer updated successfully.");
        await client.query('COMMIT');
        return res.json({ success: true });
      }

      console.log("Invalid type specified.");
      return res.status(400).json({ error: "Invalid content type" });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating content:", error);
    return res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete("/:id", checkLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const userid = req.user.userid;

    if (!type || !["question", "answer"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing content type" });
    }

    const client = await dbConnection.connect();
    try {
      await client.query('BEGIN');

      if (type === "question") {
        const { rows: questions } = await client.query(
          "SELECT userid FROM questionTable WHERE questionid = $1", 
          [id]
        );

        if (questions.length === 0) {
          return res.status(404).json({ error: "Question not found" });
        }

        if (questions[0].userid !== userid) {
          return res.status(403).json({ error: "Unauthorized to delete this question" });
        }

        await client.query(
          "DELETE FROM answerTable WHERE questionid = $1", 
          [id]
        );

        await client.query(
          "DELETE FROM questionTable WHERE questionid = $1", 
          [id]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: "Question and associated answers deleted successfully" });
      } else {
        const { rows: answers } = await client.query(
          "SELECT userid FROM answerTable WHERE answerid = $1", 
          [id]
        );

        if (answers.length === 0) {
          return res.status(404).json({ error: "Answer not found" });
        }

        if (answers[0].userid !== userid) {
          return res.status(403).json({ error: "Unauthorized to delete this answer" });
        }

        await client.query(
          "DELETE FROM answerTable WHERE answerid = $1", 
          [id]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: "Answer deleted successfully" });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({ 
      error: "Couldn't delete content",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
