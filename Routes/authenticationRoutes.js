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
    const [users] = await dbConnection
      .promise()
      .execute(
        "SELECT userid, firstname, username, email FROM userTable WHERE userid = ?",
        [req.user.userid]
      );
    console.log("User query result:", users);
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(users[0]);
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

router.post("/register", checkSignUp, async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;

    const [existingUsers] = await dbConnection
      .promise()
      .execute(
        "SELECT username, email FROM userTable WHERE username = ? OR email = ?",
        [username, email]
      );

    if (existingUsers.some((user) => user.username === username)) {
      return res.status(400).json({ error: "Username already taken" });
    }

    if (existingUsers.some((user) => user.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await dbConnection
      .promise()
      .execute(
        "INSERT INTO userTable (username, email, firstname, lastname, password) VALUES (?, ?, ?, ?, ?)",
        [username, email, firstname, lastname, hashedPassword]
      );

    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error("Registration error:", error); // ✅ Logs the actual issue in terminal
    res.status(500).json({
      error: "Registration failed",
      details: error.message, // ✅ Send the real error back
      stack: error.stack, // ✅ Optional: see where it occurred
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const [users] = await dbConnection
      .promise()
      .execute("SELECT * FROM userTable WHERE email = ?", [email]);

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
