import { Url } from "../models/Url.js";
import { customAlphabet } from "nanoid";

// Standard Base62 alphabet
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 7);

const generateShortCode = () => {
  return nanoid();
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