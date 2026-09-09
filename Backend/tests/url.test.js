import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { normalizeUrl } from "../utils/normalizeUrl.js";
import { isValidUrl } from "../utils/validateUrl.js";
import { isValidCustomCode } from "../utils/validateCustomCode.js";
import { validateExpiryDate } from "../utils/validateExpiryDate.js";
import { checkUrlSafety } from "../utils/urlSafetyChecker.js";

describe("URL Utilities & Validation Test Suite", () => {
  describe("normalizeUrl()", () => {
    it("should prepend https:// if protocol is missing", () => {
      assert.equal(normalizeUrl("google.com"), "https://google.com");
      assert.equal(normalizeUrl("github.com/repo"), "https://github.com/repo");
    });

    it("should preserve existing https:// and http:// protocols", () => {
      assert.equal(normalizeUrl("https://example.com"), "https://example.com");
      assert.equal(normalizeUrl("http://example.com"), "http://example.com");
    });

    it("should trim surrounding whitespace", () => {
      assert.equal(normalizeUrl("   https://example.com/test   "), "https://example.com/test");
    });

    it("should return empty string for empty input", () => {
      assert.equal(normalizeUrl(""), "");
    });
  });

  describe("isValidUrl()", () => {
    it("should accept valid http and https URLs", () => {
      assert.equal(isValidUrl("https://www.example.com"), true);
      assert.equal(isValidUrl("https://sub.domain.co.uk/path?key=value#hash"), true);
      assert.equal(isValidUrl("http://localhost"), true);
    });

    it("should reject invalid URLs", () => {
      assert.equal(isValidUrl("not-a-valid-url"), false);
      assert.equal(isValidUrl("ftp://files.example.com"), false);
      assert.equal(isValidUrl(""), false);
    });
  });

  describe("isValidCustomCode()", () => {
    it("should accept valid 3-20 character alphanumeric aliases with hyphen/underscore", () => {
      assert.equal(isValidCustomCode("my-link"), true);
      assert.equal(isValidCustomCode("summer_sale_2026"), true);
      assert.equal(isValidCustomCode("abc"), true);
      assert.equal(isValidCustomCode("12345678901234567890"), true);
    });

    it("should reject invalid custom codes", () => {
      assert.equal(isValidCustomCode("ab"), false); // too short (< 3)
      assert.equal(isValidCustomCode("a".repeat(21)), false); // too long (> 20)
      assert.equal(isValidCustomCode("bad code"), false); // contains space
      assert.equal(isValidCustomCode("bad@alias"), false); // contains special char
      assert.equal(isValidCustomCode("promo$"), false);
    });
  });

  describe("validateExpiryDate()", () => {
    it("should return valid when no date is provided", () => {
      const res = validateExpiryDate(null);
      assert.equal(res.isValid, true);
      assert.equal(res.expiryDate, null);
    });

    it("should accept a future date", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const res = validateExpiryDate(futureDate);
      assert.equal(res.isValid, true);
      assert.ok(res.expiryDate instanceof Date);
    });

    it("should reject past dates", () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const res = validateExpiryDate(pastDate);
      assert.equal(res.isValid, false);
      assert.equal(res.message, "Expiry date must be a future date");
    });

    it("should reject invalid date strings", () => {
      const res = validateExpiryDate("invalid-date-string");
      assert.equal(res.isValid, false);
      assert.equal(res.message, "Invalid expiry date");
    });
  });

  describe("checkUrlSafety()", () => {
    it("should strictly block dangerous schemes and protocols", () => {
      const res = checkUrlSafety("javascript:alert(1)");
      assert.equal(res.isBlocked, true);
      assert.equal(res.isSafe, false);
    });

    it("should strictly block loopback and cloud metadata SSRF addresses", () => {
      const loopback = checkUrlSafety("http://127.0.0.1:8080/admin");
      assert.equal(loopback.isBlocked, true);
      assert.equal(loopback.isSafe, false);

      const localhost = checkUrlSafety("http://localhost:3000");
      assert.equal(localhost.isBlocked, true);

      const metadata = checkUrlSafety("http://169.254.169.254/latest/meta-data");
      assert.equal(metadata.isBlocked, true);

      const privateIp = checkUrlSafety("http://192.168.1.150/admin");
      assert.equal(privateIp.isBlocked, true);
    });

    it("should identify suspicious TLDs as unsafe with reasons", () => {
      const res1 = checkUrlSafety("https://free-gifts.xyz/win");
      assert.equal(res1.isSafe, false);
      assert.ok(res1.reasons.length > 0);

      const res2 = checkUrlSafety("https://rewards.top/claim");
      assert.equal(res2.isSafe, false);
    });

    it("should identify brand phishing domains as unsafe", () => {
      const res1 = checkUrlSafety("https://paypal.secure-update-account.com");
      assert.equal(res1.isSafe, false);
      assert.ok(res1.reasons.some((r) => r.includes("paypal")));

      const res2 = checkUrlSafety("https://apple.id-verify-session.org");
      assert.equal(res2.isSafe, false);
    });

    it("should identify credential phishing keywords in paths", () => {
      const res = checkUrlSafety("https://some-service.com/verify_account");
      assert.equal(res.isSafe, false);
      assert.ok(res.reasons.some((r) => r.includes("verify_account")));
    });

    it("should pass legitimate domains as safe", () => {
      const res1 = checkUrlSafety("https://www.google.com");
      assert.equal(res1.isSafe, true);
      assert.equal(res1.isBlocked, false);
      assert.equal(res1.reasons.length, 0);

      const res2 = checkUrlSafety("https://github.com/NSAITEJA38/URL_Shortner");
      assert.equal(res2.isSafe, true);

      const res3 = checkUrlSafety("https://developer.mozilla.org/en-US/");
      assert.equal(res3.isSafe, true);
    });
  });
});
