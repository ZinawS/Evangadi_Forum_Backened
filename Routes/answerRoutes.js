/**
 * Answer routes
 */
import express from "express";
import { getAnswers, createAnswer } from "../controllers/answerController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (none)

// Protected routes
router.get("/:questionid", checkLogin, getAnswers);
router.post("/", checkLogin, createAnswer);

export default router;
