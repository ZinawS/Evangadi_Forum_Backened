/**
 * Question routes
 */
import express from "express";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
} from "../controllers/questionController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (none)

// Protected routes
router.get("/", checkLogin, getQuestions);
router.get("/:questionid", checkLogin, getQuestionById);
router.post("/", checkLogin, createQuestion);

export default router;
