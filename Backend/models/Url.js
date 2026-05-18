import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    clickedAt: {
      type: Date,
      default: Date.now
    },

    userAgent: {
      type: String,
      default: ""
    },

    ipAddress: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    shortUrl: {
      type: String,
      required: true
    },

    clicks: {
      type: Number,
      default: 0
    },

    clickHistory: {
      type: [clickSchema],
      default: []
    },

    expiresAt: {
      type: Date,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Url = mongoose.model("Url", urlSchema);