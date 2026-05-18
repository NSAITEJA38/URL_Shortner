import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { urlRoute } from "./APIs/UrlAPI.js";
// import { errorMiddleware } from "./middlewares/errorMiddleware.js";
// import { notFoundMiddleware } from "./middlewares/notFoundMiddleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("URL Shortener Backend is running");
});

// URL API routes
app.use("/", urlRoute);

// not found middleware
// app.use(notFoundMiddleware);

// error middleware
// app.use(errorMiddleware);

// connect database
const connectdb = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("DataBase Connection Success");

    app.listen(PORT, () => {
      console.log(`Server Started on port ${PORT}`);
    });
  } catch (err) {
    console.log("Error in connecting database", err.message);
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

  // ✅ HANDLE CUSTOM ERRORS
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