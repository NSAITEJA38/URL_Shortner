import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { generalLimiter } from "./middlewares/rateLimiters.js";
import { urlRoute } from "./APIs/UrlAPI.js";
import { userRoute } from "./APIs/userAPI.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Security & rate limiting middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
  })
);
app.use(generalLimiter);

// middlewares
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "https://url-shortner-frontend-f3zc.onrender.com"
    ].filter(Boolean),
    credentials: true
  })
);

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("URL Shortener Backend is running");
});

// health check route
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// user route
app.use("/user", userRoute);

// URL API routes
app.use("/", urlRoute);

const connectdb = async () => {
  let dbUrl = process.env.DB_URL || process.env.MONGO_URI;

  if (!dbUrl) {
    console.error("FATAL ERROR: Neither DB_URL nor MONGO_URI environment variable is defined!");
    console.error("Please configure it in your .env or Render dashboard.");
    setTimeout(() => process.exit(1), 1000);
    return;
  }
  const atCount = (dbUrl.match(/@/g) || []).length;
  if (atCount > 1) {
    const lastAtIndex = dbUrl.lastIndexOf("@");
    const beforeLastAt = dbUrl.substring(0, lastAtIndex).replace(/@/g, "%40");
    const afterLastAt = dbUrl.substring(lastAtIndex);
    dbUrl = beforeLastAt + afterLastAt;
    console.log("Auto-fixed malformed DB_URL (URL-encoded special characters in password).");
  }

  try {
    await mongoose.connect(dbUrl);
    console.log("DataBase Connection Success");

    app.listen(PORT, () => {
      console.log(`Server Started on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error in connecting database:", err.message);
    setTimeout(() => process.exit(1), 1000);
  }
};

connectdb();

app.use((err, req, res, next) => {

  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Full error:", err);

  // mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //  HANDLE CUSTOM ERRORS
  if (err.status) {
    return res.status(err.status).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // default server error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});