/**
 * Category routes
 */
import express from "express";
import { getCategories } from "../controllers/categoryController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/", checkLogin, getCategories);

export default router;
