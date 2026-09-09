import express from "express";
import geoip from "geoip-lite";
import redisClient from "../utils/redisClient.js";

import { validateExpiryDate } from "../utils/validateExpiryDate.js";
import { isValidUrl } from "../utils/validateUrl.js";
import { isValidCustomCode } from "../utils/validateCustomCode.js";
import { normalizeUrl } from "../utils/normalizeUrl.js";
import { generateUniqueShortCode } from "../utils/generateShortCode.js";
import { checkUrlSafety } from "../utils/urlSafetyChecker.js";

import {
  findUrlByShortCode,
  checkShortCodeExists,
  createUrl,
  getAllUrlsFromDB,
  getUrlsByUserId,
  deleteUrlByShortCode,
  deactivateUrlByShortCode,
  recordClick
} from "../services/UrlService.js";

import { protect, optionalProtect } from "../middlewares/userMiddleware.js";
import { shortenLimiter } from "../middlewares/rateLimiters.js";

export const urlRoute = express.Router();

// Pre-flight URL safety check
urlRoute.post("/check-safety", async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }
    const finalOriginalUrl = normalizeUrl(url);
    const safetyResult = checkUrlSafety(finalOriginalUrl);
    res.status(200).json({
      success: true,
      data: safetyResult
    });
  } catch (error) {
    next(error);
  }
});

// Create short URL
urlRoute.post("/shorten", shortenLimiter, optionalProtect, async (req, res, next) => {
  try {
    const { originalUrl, customCode, expiresAt, singleUse, allowUnsafe } = req.body;

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

    // Comprehensive URL Security & Threat Detection
    const safetyResult = checkUrlSafety(finalOriginalUrl);

    // Tier 1: Strictly prohibited exploits (SSRF, loopback, dangerous schemes, restricted ports)
    if (safetyResult.isBlocked) {
      return res.status(400).json({
        success: false,
        blocked: true,
        message: `Blocked for security: ${safetyResult.reasons[0] || "Prohibited URL"}`,
        reasons: safetyResult.reasons
      });
    }

    // Tier 2: Suspicious or potentially harmful links (phishing, high-risk TLDs, raw IP)
    if (!safetyResult.isSafe && !allowUnsafe) {
      return res.status(422).json({
        success: false,
        isUnsafe: true,
        message: "Security Warning: Potentially harmful or suspicious URL detected",
        reasons: safetyResult.reasons
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

    const baseUrl = process.env.BASE_URL || `https://${req.get("host")}`;
    const shortUrl = `${baseUrl}/${shortCode}`;

    const newUrl = await createUrl({
      originalUrl: finalOriginalUrl,
      shortCode,
      shortUrl,
      expiresAt: expiryResult.expiryDate,
      userId: req.user?._id,
      singleUse: Boolean(singleUse),
      isSafe: safetyResult.isSafe,
      safetyReasons: safetyResult.reasons
    });

    res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: newUrl,
      warning: !safetyResult.isSafe ? "URL was flagged as potentially suspicious" : undefined
    });
  } catch (error) {
    next(error);
  }
});

// Get all URLs for a user
urlRoute.get("/urls", protect, async (req, res, next) => {
  try {
    const urls = await getUrlsByUserId(req.user._id);

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
urlRoute.get("/url/:shortCode", protect, async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (urlData.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
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
urlRoute.get("/stats/:shortCode", protect, async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (urlData.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
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
        isActive: urlData.isActive,
        singleUse: urlData.singleUse
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update URL
urlRoute.put("/url/:shortCode", protect, async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { originalUrl, expiresAt, isActive, singleUse, allowUnsafe } = req.body;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (urlData.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (originalUrl) {
      const finalOriginalUrl = normalizeUrl(originalUrl);

      if (!isValidUrl(finalOriginalUrl)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL"
        });
      }

      const safetyResult = checkUrlSafety(finalOriginalUrl);

      if (safetyResult.isBlocked) {
        return res.status(400).json({
          success: false,
          blocked: true,
          message: `Blocked for security: ${safetyResult.reasons[0] || "Prohibited URL"}`,
          reasons: safetyResult.reasons
        });
      }

      if (!safetyResult.isSafe && !allowUnsafe) {
        return res.status(422).json({
          success: false,
          isUnsafe: true,
          message: "Security Warning: Potentially harmful or suspicious URL detected",
          reasons: safetyResult.reasons
        });
      }

      urlData.originalUrl = finalOriginalUrl;
      urlData.isSafe = safetyResult.isSafe;
      urlData.safetyReasons = safetyResult.reasons;
    }

    if (expiresAt !== undefined) {
      if (!expiresAt || expiresAt === null || expiresAt === "") {
        urlData.expiresAt = null;
      } else {
        const expiryResult = validateExpiryDate(expiresAt);

        if (!expiryResult.isValid) {
          return res.status(400).json({
            success: false,
            message: expiryResult.message
          });
        }

        urlData.expiresAt = expiryResult.expiryDate;
      }
    }

    if (typeof singleUse === "boolean") {
      urlData.singleUse = singleUse;
    }

    if (typeof isActive === "boolean") {
      urlData.isActive = isActive;
    }

    await urlData.save();

    if (redisClient.isReady) await redisClient.del(`url:${shortCode}`);

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
urlRoute.delete("/url/:shortCode", protect, async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);
    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (urlData.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await deleteUrlByShortCode(shortCode);

    if (redisClient.isReady) await redisClient.del(`url:${shortCode}`);

    res.status(200).json({
      success: true,
      message: "URL deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate URL
urlRoute.patch("/url/:shortCode/deactivate", protect, async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (urlData.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    urlData.isActive = false;
    await urlData.save();

    if (redisClient.isReady) await redisClient.del(`url:${shortCode}`);

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
urlRoute.patch("/url/:shortCode/activate", protect, async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const urlData = await findUrlByShortCode(shortCode);

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    if (urlData.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    urlData.isActive = true;
    await urlData.save();

    if (redisClient.isReady) await redisClient.del(`url:${shortCode}`);

    res.status(200).json({
      success: true,
      message: "URL activated successfully",
      data: urlData
    });
  } catch (error) {
    next(error);
  }
});

const getFrontendBaseUrl = (req) => {
  if (req?.headers?.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      if (refUrl.host.includes("localhost") || refUrl.host.includes("onrender.com")) {
        return `${refUrl.protocol}//${refUrl.host}`;
      }
    } catch {
      // fallback
    }
  }
  const host = req?.headers?.host || "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return process.env.FRONTEND_URL || "http://localhost:5173";
  }
  return process.env.FRONTEND_URL || "https://url-shortner-frontend-f3zc.onrender.com";
};

const renderErrorHTML = (title, message, req) => {
  const frontendUrl = getFrontendBaseUrl(req);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f9fafb;
            color: #111827;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            text-align: center;
            background: white;
            padding: 48px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            max-width: 440px;
            width: 100%;
            border-top: 4px solid #ef4444;
        }
        .icon {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: #fee2e2;
            color: #ef4444;
            margin-bottom: 24px;
        }
        .icon svg {
            width: 32px;
            height: 32px;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 12px;
            color: #111827;
        }
        p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 32px;
            color: #4b5563;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            transition: background-color 0.2s, transform 0.1s;
        }
        .btn:hover {
            background-color: #2563eb;
        }
        .btn:active {
            transform: translateY(1px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="${frontendUrl}/dashboard" class="btn">Return to Dashboard</a>
    </div>
</body>
</html>
`;
};

const renderWarningHTML = (urlData, req) => {
  const frontendUrl = getFrontendBaseUrl(req);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Warning</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f9fafb; color: #111827; padding: 20px; box-sizing: border-box; }
        .container { text-align: center; background: white; padding: 40px 32px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 480px; width: 100%; border-top: 4px solid #f59e0b; }
        .icon { display: inline-flex; justify-content: center; align-items: center; width: 64px; height: 64px; border-radius: 50%; background-color: #fef3c7; color: #d97706; margin-bottom: 20px; }
        .icon svg { width: 32px; height: 32px; }
        h1 { font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 10px; color: #111827; }
        p { font-size: 14px; line-height: 1.5; margin-bottom: 20px; color: #4b5563; }
        .dest-box { background: #f3f4f6; border-radius: 6px; padding: 10px 12px; font-family: monospace; font-size: 13px; color: #374151; word-break: break-all; margin-bottom: 20px; border: 1px solid #e5e7eb; text-align: left; }
        .btn-group { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .btn { display: inline-block; padding: 12px 22px; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; }
        .btn-safe { background-color: #ef4444; }
        .btn-proceed { background-color: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }
        .btn-safe:hover { background-color: #dc2626; }
        .btn-proceed:hover { background-color: #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1>Suspected Unsafe Link</h1>
        <p>This link has been flagged by our security systems as potentially malicious (e.g. phishing, brand spoof, or unsafe domain).</p>
        
        <div class="dest-box">
            <div style="font-size: 11px; color: #6b7280; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">Destination URL:</div>
            ${urlData.originalUrl}
        </div>

        ${
          urlData.safetyReasons && urlData.safetyReasons.length > 0
            ? `<div style="text-align: left; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <p style="font-size: 12px; font-weight: 600; color: #92400e; margin: 0 0 6px 0; text-transform: uppercase;">Detected Security Issues:</p>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #b45309;">
                  ${urlData.safetyReasons.map((r) => `<li style="margin-bottom: 4px;">${r}</li>`).join("")}
                </ul>
               </div>`
            : ""
        }
        <div class="btn-group">
            <a href="${frontendUrl}/dashboard" class="btn btn-safe">Go to Safety</a>
            <a href="/${urlData.shortCode}?proceed=true" class="btn btn-proceed">Continue Anyway</a>
        </div>
    </div>
</body>
</html>
`;
};

// Redirect short URL
// Keep this route at the bottom
urlRoute.get("/:shortCode", async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    let urlData = null;

    if (redisClient.isReady) {
      const cached = await redisClient.get(`url:${shortCode}`);
      if (cached) {
        urlData = JSON.parse(cached);
      }
    }

    if (!urlData) {
      urlData = await findUrlByShortCode(shortCode);
      if (urlData && redisClient.isReady) {
        await redisClient.set(`url:${shortCode}`, JSON.stringify(urlData));
      }
    }

    if (!urlData) {
      return res.status(404).type('html').send(renderErrorHTML("Link Not Found", "The short URL you are trying to access does not exist. It might have been deleted or typed incorrectly.", req));
    }

    if (!urlData.isActive) {
      return res.status(403).type('html').send(renderErrorHTML("Link Deactivated", "This short URL has been temporarily deactivated by its owner.", req));
    }

    if (urlData.expiresAt && new Date() > new Date(urlData.expiresAt)) {
      return res.status(410).type('html').send(renderErrorHTML("Link Expired", "This short URL has expired and is no longer available.", req));
    }

    const ipAddress = req.ip || req.connection.remoteAddress || "";
    let country = "";
    let region = "";
    
    if (ipAddress) {
      const geo = geoip.lookup(ipAddress);
      if (geo) {
        country = geo.country || "";
        region = geo.region || "";
      }
    }

    const clickData = {
      clickedAt: new Date(),
      userAgent: req.headers["user-agent"] || "",
      ipAddress,
      country,
      region
    };

    // Safety Interstitial Check
    if (urlData.isSafe === false && req.query.proceed !== 'true') {
      return res.status(403).type('html').send(renderWarningHTML(urlData, req));
    }

    recordClick(shortCode, clickData);

    if (urlData.singleUse) {
      await deactivateUrlByShortCode(shortCode);
      if (redisClient.isReady) {
        await redisClient.del(`url:${shortCode}`);
      }
      
      // Prevent browser from caching the redirect for single-use links
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }

    return res.redirect(urlData.originalUrl);
  } catch (error) {
    next(error);
  }
});