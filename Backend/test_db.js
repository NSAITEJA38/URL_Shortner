import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Url } from './models/Url.js';

dotenv.config({ path: './.env' });

const checkDb = async () => {
  await mongoose.connect(process.env.DB_URL || process.env.MONGO_URI);
  console.log("Connected to DB");
  const urls = await Url.find().sort({ createdAt: -1 }).limit(5);
  for (const url of urls) {
    console.log(`${url.shortCode} -> ${url.originalUrl} | isSafe: ${url.isSafe}`);
  }
  process.exit(0);
};

checkDb();
