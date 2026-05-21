import { Url } from "../models/Url.js";

export const findUrlByShortCode = async (shortCode) => {
  return await Url.findOne({ shortCode });
};

export const checkShortCodeExists = async (shortCode) => {
  return await Url.findOne({ shortCode });
};

export const createUrl = async ({ originalUrl, shortCode, shortUrl, expiresAt, userId }) => {
  return await Url.create({
    originalUrl,
    shortCode,
    shortUrl,
    expiresAt,
    userId
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