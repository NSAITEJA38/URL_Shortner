import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { protect } from "../middlewares/userMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import validator from "validator";
import { authLimiter } from "../middlewares/rateLimiters.js";

export const userRoute = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

userRoute.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please add all fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    if (user) {
      res.status(201).json({
        success: true,
        data: { _id: user.id, name: user.name, email: user.email, token: generateToken(user._id) },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
});

userRoute.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        data: { _id: user.id, name: user.name, email: user.email, token: generateToken(user._id) },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    next(error);
  }
});

userRoute.get("/me", protect, async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
});

userRoute.post("/forgot-password", authLimiter, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
        <h2 style="color: #0f172a; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">You are receiving this email because you (or someone else) has requested to reset the password for your URL Shortener account.</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">Please click on the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 25px 0; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset My Password</a>
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">&copy; ${new Date().getFullYear()} URL Shortener</p>
      </div>
    `;

    // Send email asynchronously in the background so HTTP response is instant
    sendEmail({
      email: user.email,
      subject: "Password Reset Token - URL Shortener",
      html: message,
    }).catch((err) => {
      console.warn("[BACKGROUND EMAIL WARNING]", err.message);
    });

    return res.status(200).json({
      success: true,
      message: process.env.EMAIL_USER
        ? "Password reset link sent to your email! You can also use the direct button below."
        : "Password reset link generated instantly! Use the button below to reset your password.",
      data: resetUrl,
      resetUrl,
      emailDelivered: Boolean(process.env.EMAIL_USER)
    });
  } catch (error) {
    next(error);
  }
});

userRoute.put("/reset-password/:token", async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});
