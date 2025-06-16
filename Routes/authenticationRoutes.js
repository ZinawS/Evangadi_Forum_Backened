import express from "express";
import { checkSignUp, checkLogin } from "../Middleware/middleware.js";
import { makeToken } from "../TokenGenerator/JWT.js";
import dbConnection from "../Database/database_config.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {
  forgotPassword,
  resetPassword,
} from "../Control_password/passwordRecovery.js";

dotenv.config();
const router = express.Router();

router.get("/checkUser", checkLogin, async (req, res) => {
  try {
    console.log("Fetching user for userid:", req.user.userid);
    const { rows } = await dbConnection.query(
      "SELECT userid, firstname, username, email FROM userTable WHERE userid = $1",
      [req.user.userid]
    );
    console.log("User query result:", rows);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

router.post("/register", checkSignUp, async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;

    const { rows: existingUsers } = await dbConnection.query(
      "SELECT username, email FROM userTable WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUsers.some((user) => user.username === username)) {
      return res.status(400).json({ error: "Username already taken" });
    }

    if (existingUsers.some((user) => user.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await dbConnection.query(
      "INSERT INTO userTable (username, email, firstname, lastname, password) VALUES ($1, $2, $3, $4, $5)",
      [username, email, firstname, lastname, hashedPassword]
    );

    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { rows: users } = await dbConnection.query(
      "SELECT * FROM userTable WHERE email = $1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Wrong email or password" });
    }

    const user = users[0];
    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
      return res.status(401).json({ error: "Wrong email or password" });
    }

    const token = makeToken(user.userid);
    res.json({ token, message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
