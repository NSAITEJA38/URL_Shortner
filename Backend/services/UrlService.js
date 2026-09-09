import { Url } from "../models/Url.js";

export const findUrlByShortCode = async (shortCode) => {
  return await Url.findOne({ shortCode });
};

export const checkShortCodeExists = async (shortCode) => {
  return await Url.findOne({ shortCode });
};

export const createUrl = async ({ originalUrl, shortCode, shortUrl, expiresAt, userId, singleUse, isSafe, safetyReasons = [] }) => {
  return await Url.create({
    originalUrl,
    shortCode,
    shortUrl,
    expiresAt,
    userId,
    singleUse,
    isSafe,
    safetyReasons
  });
};

export const getAllUrlsFromDB = async () => {
  return await Url.find().sort({ createdAt: -1 });
};

export const getUrlsByUserId = async (userId) => {
  return await Url.find({ userId }).sort({ createdAt: -1 });
};

export const deleteUrlByShortCode = async (shortCode) => {
  return await Url.findOneAndDelete({ shortCode });
};

export const deactivateUrlByShortCode = async (shortCode) => {
  return await Url.updateOne({ shortCode }, { isActive: false });
};

export const recordClick = (shortCode, clickData) => {
  // Fire and forget, don't await this so redirects are fast
  Url.updateOne(
    { shortCode },
    {
      $inc: { clicks: 1 },
      $push: { clickHistory: clickData }
    }
  ).exec().catch(err => console.error("Error recording click asynchronously:", err));
};