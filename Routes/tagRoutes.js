/**
 * Tag routes
 */
import express from "express";
import { getTags } from "../controllers/tagController.js";
import { checkLogin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/", checkLogin, getTags);

export default router;
