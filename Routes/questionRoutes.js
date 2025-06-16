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
    const [questions] = await dbConnection
      .promise()
      .query(
        "SELECT q.*, u.username FROM questionTable q JOIN userTable u ON q.userid = u.userid"
      );

    res.json({ questions });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ error: "Couldn't get questions" });
  }
});

/**
 * GET single question by ID
 * Route: GET /api/question/:questionid
 */
router.get("/:questionid", async (req, res) => {
  try {
    const { questionid } = req.params;

    const [questions] = await dbConnection
      .promise()
      .execute(
        "SELECT q.*, u.username FROM questionTable q JOIN userTable u ON q.userid = u.userid WHERE q.questionid = ?",
        [questionid]
      );

    if (questions.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(questions[0]);
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({ error: "Couldn't get question" });
  }
});

/**
 * POST a new question
 * Route: POST /api/question
 */
router.post("/", checkLogin, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const userid = req.user.userid;
    const questionid = uuidv4();

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description required" });
    }

    await dbConnection
      .promise()
      .execute(
        "INSERT INTO questionTable (questionid, userid, title, description, tag) VALUES (?, ?, ?, ?, ?)",
        [questionid, userid, title, description, tag || null]
      );

    res.status(201).json({ message: "Question posted", questionid });
  } catch (error) {
    console.error("Post question error:", error);
    res.status(500).json({ error: "Couldn't post question" });
  }
});

export default router;
