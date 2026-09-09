import { describe, it } from "node:test";
import assert from "node:assert/strict";
import validator from "validator";

describe("User Input Validation Test Suite", () => {
  describe("Email validation", () => {
    it("should accept valid emails", () => {
      assert.equal(validator.isEmail("user@example.com"), true);
      assert.equal(validator.isEmail("name.surname+tag@domain.co.in"), true);
    });

    it("should reject invalid emails", () => {
      assert.equal(validator.isEmail("notanemail"), false);
      assert.equal(validator.isEmail("user@"), false);
      assert.equal(validator.isEmail("@example.com"), false);
    });
  });

  describe("Password length requirements", () => {
    it("should enforce minimum 6 characters", () => {
      const isValidLength = (pwd) => pwd && pwd.length >= 6;
      assert.equal(isValidLength("12345"), false);
      assert.equal(isValidLength("123456"), true);
      assert.equal(isValidLength("supersecretpwd"), true);
    });
  });
});
