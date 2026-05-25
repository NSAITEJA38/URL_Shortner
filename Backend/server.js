import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { urlRoute } from "./APIs/UrlAPI.js";
import { userRoute } from "./APIs/userAPI.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("URL Shortener Backend is running");
});

// user route
app.use("/user", userRoute);

// URL API routes
app.use("/", urlRoute);



const connectdb = async () => {
  let dbUrl = process.env.DB_URL;

  if (!dbUrl) {
    console.error("FATAL ERROR: DB_URL environment variable is not defined!");
    console.error("Please configure it in your Render dashboard.");
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