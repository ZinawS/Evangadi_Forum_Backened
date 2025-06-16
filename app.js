import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./Routes/authenticationRoutes.js";
import questionRoutes from "./Routes/questionRoutes.js";
import answerRoutes from "./Routes/answerRoutes.js";
import contentRoutes from "./Routes/edit_DeleteRoutes.js"; // Editing and deleting question and answers

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// ==============================================
// MIDDLEWARE CONFIGURATION
// ==============================================
app.use(helmet());
app.use(
  cors({
    // origin: process.env.CORS_ORIGIN || "*",
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per window
    message: "Too many requests from this IP, please try again later",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================================
// ROUTES
// ==============================================
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/answer", answerRoutes);
app.use("/api/content", contentRoutes);

// ==============================================
// ERROR HANDLING
// ==============================================
// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ==============================================
// SERVER INITIALIZATION
// ==============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
