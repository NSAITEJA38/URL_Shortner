import rateLimit from "express-rate-limit";

// Auth rate limiter (login, register, forgot-password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes."
  }
});

// Shorten rate limiter (creating short links)
export const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // Limit each IP to 60 shorten requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many links created from this IP. Please try again after 15 minutes."
  }
});

// General API limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});
