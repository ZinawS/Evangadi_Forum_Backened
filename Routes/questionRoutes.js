import express from "express";
import { v4 as uuidv4 } from "uuid";
import dbConnection from "../Database/database_config.js";
import { checkLogin } from "../Middleware/middleware.js";

const router = express.Router();

/**
 * GET all questions with usernames
 * Route: GET /api/question
 */
router.get("/", async (req, res) => {
  try {
    const { rows: questions } = await dbConnection.query(
      `SELECT q.*, u.username 
       FROM questionTable q 
       JOIN userTable u ON q.userid = u.userid`
    );

    res.json({ questions });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ 
      error: "Couldn't get questions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET single question by ID
 * Route: GET /api/question/:questionid
 */
router.get("/:questionid", async (req, res) => {
  try {
    const { questionid } = req.params;

    const { rows: questions } = await dbConnection.query(
      `SELECT q.*, u.username 
       FROM questionTable q 
       JOIN userTable u ON q.userid = u.userid 
       WHERE q.questionid = $1`,
      [questionid]
    );

    if (questions.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(questions[0]);
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({ 
      error: "Couldn't get question",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST a new question
 * Route: POST /api/question
 */
router.post("/", checkLogin, async (req, res) => {
  const client = await dbConnection.connect();
  try {
    const { title, description, tag } = req.body;
    const userid = req.user.userid;
    const questionid = uuidv4();

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description required" });
    }

    await client.query('BEGIN');

    const { rowCount } = await client.query(
      `INSERT INTO questionTable 
       (questionid, userid, title, description, tag) 
       VALUES ($1, $2, $3, $4, $5)`,
      [questionid, userid, title, description, tag || null]
    );

    await client.query('COMMIT');

    if (rowCount === 1) {
      res.status(201).json({ message: "Question posted", questionid });
    } else {
      throw new Error("Question insertion failed");
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Post question error:", error);
    res.status(500).json({ 
      error: "Couldn't post question",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

export default router;
