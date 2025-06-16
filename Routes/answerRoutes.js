import express from "express";
import { checkLogin } from "../Middleware/middleware.js";
import dbConnection from "../Database/database_config.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// GET answers
router.get("/:questionid", checkLogin, async (req, res) => {
  try {
    const { questionid } = req.params;
    const { rows: answers } = await dbConnection.query(
      `SELECT a.*, u.username 
       FROM answerTable a 
       JOIN userTable u ON a.userid = u.userid 
       WHERE a.questionid = $1`,
      [questionid]
    );

    if (answers.length === 0) {
      return res.status(404).json({ error: "No answers found" });
    }

    res.json({ answers });
  } catch (error) {
    console.error("Get answers error:", error);
    res.status(500).json({ 
      error: "Couldn't get answers",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST answer
router.post("/", checkLogin, async (req, res) => {
  try {
    const { questionid, answer } = req.body;
    const userid = req.user.userid;

    if (!questionid || !answer) {
      return res.status(400).json({ error: "Question ID and answer required" });
    }

    // Start transaction
    const client = await dbConnection.connect();
    try {
      await client.query('BEGIN');

      // Check if question exists
      const { rows: questions } = await client.query(
        "SELECT * FROM questionTable WHERE questionid = $1",
        [questionid]
      );

      if (questions.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Question not found" });
      }

      // Insert answer
      await client.query(
        "INSERT INTO answerTable (questionid, userid, answer) VALUES ($1, $2, $3)",
        [questionid, userid, answer]
      );

      // Get question owner's email
      const questionOwnerId = questions[0].userid;
      const { rows: users } = await client.query(
        "SELECT email FROM userTable WHERE userid = $1",
        [questionOwnerId]
      );

      // Commit transaction
      await client.query('COMMIT');

      // Send email notification if recipient exists
      if (users.length > 0) {
        const recipientEmail = users[0].email;
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipientEmail,
          subject: "New Answer to Your Question",
          html: `
            <p>Your question titled <strong>${questions[0].title}</strong> has a new answer:</p>
            <p><em>${answer}</em></p>
            <p><a href="${process.env.FRONTEND_URL}/question/${questionid}">View the discussion</a></p>
          `,
        });
      }

      res.status(201).json({ message: "Answer posted and email sent" });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Post answer error:", error);
    res.status(500).json({ 
      error: "Couldn't post answer",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
