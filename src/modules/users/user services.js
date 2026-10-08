import jwt from "jsonwebtoken";
import User from "../../db/models/User.js";
import { encryption, decryption } from "../../utils/security/encryption.js";
import { hashPassword, comparePassword } from "../../utils/security/hash.js";

const signAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  });
};

const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

export async function signup({ username, email, password }) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  const user = new User({ username, email, password: passwordHash });
  await user.save();
  return user;
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  return { user, accessToken, refreshToken };
}

export async function refresh({ refreshToken }) {
  if (!refreshToken) {
    const err = new Error("Refresh token is required");
    err.status = 400;
    throw err;
  }
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 401;
      throw err;
    }
    const accessToken = signAccessToken(user._id.toString());
    return { accessToken };
  } catch (e) {
    const err = new Error("Invalid or expired refresh token");
    err.status = 401;
    throw err;
  }
}

export async function getUserById(requestedId, authUserId) {
  if (requestedId !== authUserId) {
    const err = new Error("Forbidden: you can only access your own data");
    err.status = 403;
    throw err;
  }
  const user = await User.findById(requestedId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
}

export async function sendMessage({ receiverId, content }) {
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    const err = new Error("Receiver not found");
    err.status = 404;
    throw err;
  }

  const encrypted = encryption(content);
  receiver.messages.push({ text: encrypted });

  try {
    await receiver.save();
  } catch (e) {
    if (e.name === "VersionError") {
      const err = new Error("Conflict: document was modified by another request, try again");
      err.status = 409;
      throw err;
    }
    throw e;
  }

  return { message: "Message sent anonymously" };
}

export async function getMyMessages(authUserId) {
  const user = await User.findById(authUserId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user.messages.map((m) => ({
    id: m._id,
    content: decryption(m.text),
    createdAt: m.createdAt
  }));
}
