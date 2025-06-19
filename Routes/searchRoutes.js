/**
 * Search routes
 */
import express from "express";
import { searchQuestions } from "../controllers/searchController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/", checkLogin, searchQuestions);

export default router;
