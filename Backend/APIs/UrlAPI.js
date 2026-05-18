import express from "express";

import { validateExpiryDate } from "../utils/validateExpiryDate.js";
import { isValidUrl } from "../utils/validateUrl.js";
import { isValidCustomCode } from "../utils/validateCustomCode.js";
import { normalizeUrl } from "../utils/normalizeUrl.js";
import { generateUniqueShortCode } from "../utils/generateShortCode.js";

import {
  findUrlByShortCode,
  checkShortCodeExists,
  createUrl,
  getAllUrlsFromDB,
  deleteUrlByShortCode
} from "../services/urlService.js";

export const urlRoute = express.Router();

// Create short URL
urlRoute.post("/shorten", async (req, res, next) => {
  try {
    const { originalUrl, customCode, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required"
      });
    }

    const finalOriginalUrl = normalizeUrl(originalUrl);

    if (!isValidUrl(finalOriginalUrl)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL"
      });
    }

    let shortCode;

    if (customCode) {
      if (!isValidCustomCode(customCode)) {
        return res.status(400).json({
          success: false,
          message:
            "Custom code must be 3-20 characters and can contain letters, numbers, _ and - only"
        });
      }

      const existingCode = await checkShortCodeExists(customCode);

      if (existingCode) {
        return res.status(409).json({
          success: false,
          message: "Custom short code already exists"
        });
      }

      shortCode = customCode;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    const expiryResult = validateExpiryDate(expiresAt);

    if (!expiryResult.isValid) {
      return res.status(400).json({
        success: false,
        message: expiryResult.message
      });
    }

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    const newUrl = await createUrl({
      originalUrl: finalOriginalUrl,
      shortCode,
      shortUrl,
      expiresAt: expiryResult.expiryDate
    });

    res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: newUrl
    });
  } catch (error) {
    next(error);
  }
});

// Get all URLs
urlRoute.get("/urls", async (req, res, next) => {
  try {
    const urls = await getAllUrlsFromDB();

    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls
    });
  } catch (error) {
    next(error);
  }
});

// Get single URL details
urlRoute.get("/url/:shortCode", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    res.status(200).json({
      success: true,
      data: urlData
    });
  } catch (error) {
    next(error);
  }
});

// Get URL stats
urlRoute.get("/stats/:shortCode", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        originalUrl: urlData.originalUrl,
        shortUrl: urlData.shortUrl,
        shortCode: urlData.shortCode,
        clicks: urlData.clicks,
        clickHistory: urlData.clickHistory,
        createdAt: urlData.createdAt,
        expiresAt: urlData.expiresAt,
        isActive: urlData.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update URL
urlRoute.put("/url/:shortCode", async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { originalUrl, expiresAt, isActive } = req.body;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (originalUrl) {
      const finalOriginalUrl = normalizeUrl(originalUrl);

      if (!isValidUrl(finalOriginalUrl)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL"
        });
      }

      urlData.originalUrl = finalOriginalUrl;
    }

    if (expiresAt) {
      const expiryResult = validateExpiryDate(expiresAt);

      if (!expiryResult.isValid) {
        return res.status(400).json({
          success: false,
          message: expiryResult.message
        });
      }

      urlData.expiresAt = expiryResult.expiryDate;
    }

    if (typeof isActive === "boolean") {
      urlData.isActive = isActive;
    }

    await urlData.save();

    res.status(200).json({
      success: true,
      message: "URL updated successfully",
      data: urlData
    });
  } catch (error) {
    next(error);
  }
});

// Delete URL permanently
urlRoute.delete("/url/:shortCode", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const deletedUrl = await deleteUrlByShortCode(shortCode);

    if (!deletedUrl) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "URL deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate URL
urlRoute.patch("/url/:shortCode/deactivate", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    urlData.isActive = false;
    await urlData.save();

    res.status(200).json({
      success: true,
      message: "URL deactivated successfully",
      data: urlData
    });
  } catch (error) {
    next(error);
  }
});

// Activate URL again
urlRoute.patch("/url/:shortCode/activate", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    urlData.isActive = true;
    await urlData.save();

    res.status(200).json({
      success: true,
      message: "URL activated successfully",
      data: urlData
    });
  } catch (error) {
    next(error);
  }
});

// Redirect short URL
// Keep this route at the bottom
urlRoute.get("/:shortCode", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (!urlData.isActive) {
      return res.status(403).json({
        success: false,
        message: "This short URL is deactivated"
      });
    }

    if (urlData.expiresAt && new Date() > urlData.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "This short URL has expired"
      });
    }

    urlData.clicks += 1;

    urlData.clickHistory.push({
      clickedAt: new Date(),
      userAgent: req.headers["user-agent"] || "",
      ipAddress: req.ip || req.connection.remoteAddress || ""
    });

    await urlData.save();

    return res.redirect(urlData.originalUrl);
  } catch (error) {
    next(error);
  }
});