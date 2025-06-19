/**
 * Content routes
 * Handles updates and deletions for questions and answers
 */
import express from "express";
import {
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.put("/:id", checkLogin, updateContent);
router.delete("/:id", checkLogin, deleteContent);

export default router;
