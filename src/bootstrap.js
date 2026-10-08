import express from "express";
import mongoose from "mongoose";
import * as userController from "./modules/users/user controller.js";
import authMiddleware from "./middlewares/auth.middleware.js";

function validateSignup(req, res, next) {
  const { username, email, password } = req.body || {};
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ message: "username is required (min 3 chars)" });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "valid email is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "password is required (min 6 chars)" });
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "valid email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "password is required" });
  }
  next();
}

function validateRefresh(req, res, next) {
  if (!req.body || !req.body.refreshToken) {
    return res.status(400).json({ message: "refreshToken is required" });
  }
  next();
}

function validateMessage(req, res, next) {
  const { receiverId, content } = req.body || {};
  if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({ message: "valid receiverId is required" });
  }
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "message content is required" });
  }
  if (content.length > 500) {
    return res.status(400).json({ message: "message is too long (max 500 chars)" });
  }
  next();
}

function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/auth/signup", validateSignup, userController.signup);
  app.post("/auth/login", validateLogin, userController.login);
  app.post("/auth/refresh", validateRefresh, userController.refresh);

  app.get("/users/:id", authMiddleware, userController.getUserById);

  app.post("/messages", validateMessage, userController.sendMessage);
  app.get("/messages", authMiddleware, userController.getMyMessages);

  app.get("/", (req, res) => res.status(200).json({ message: "Saraha API running" }));

  return app;
}

export default createApp;
