import * as service from "./user services.js";

export async function signup(req, res) {
  try {
    const user = await service.signup(req.body);
    return res.status(201).json({ message: "User registered", user });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { user, accessToken, refreshToken } = await service.login(req.body);
    return res.status(200).json({ message: "Login successful", user, accessToken, refreshToken });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
}

export async function refresh(req, res) {
  try {
    const { accessToken } = await service.refresh(req.body);
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
}

export async function getUserById(req, res) {
  try {
    const user = await service.getUserById(req.params.id, req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const result = await service.sendMessage(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
}

export async function getMyMessages(req, res) {
  try {
    const messages = await service.getMyMessages(req.user.id);
    return res.status(200).json({ messages });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
}
