import { Url } from "../models/Url.js";

const generateShortCode = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortCode = "";

  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    shortCode += chars[randomIndex];
  }

  return shortCode;
};

export const generateUniqueShortCode = async () => {
  let shortCode;
  let existingCode;

  do {
    shortCode = generateShortCode();
    existingCode = await Url.findOne({ shortCode });
  } while (existingCode);

  return shortCode;
};