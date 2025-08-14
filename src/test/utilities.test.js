/**
 * Simple Service Tests
 * Basic utility function tests to verify Jest setup
 */

describe("Simple Service Functions", () => {
  describe("String utilities", () => {
    test("should validate email format", () => {
      const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("invalid.email")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    test("should validate password strength", () => {
      const isStrongPassword = (password) => {
        return !!(password && password.length >= 8);
      };

      expect(isStrongPassword("password123")).toBe(true);
      expect(isStrongPassword("123")).toBe(false);
      expect(isStrongPassword("")).toBe(false);
      expect(isStrongPassword(null)).toBe(false);
      expect(isStrongPassword(undefined)).toBe(false);
    });
  });

  describe("Array utilities", () => {
    test("should filter unique values", () => {
      const getUniqueValues = (arr) => {
        return [...new Set(arr)];
      };

      expect(getUniqueValues([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(getUniqueValues(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
      expect(getUniqueValues([])).toEqual([]);
    });

    test("should calculate array sum", () => {
      const calculateSum = (numbers) => {
        return numbers.reduce((sum, num) => sum + num, 0);
      };

      expect(calculateSum([1, 2, 3, 4])).toBe(10);
      expect(calculateSum([0])).toBe(0);
      expect(calculateSum([])).toBe(0);
    });
  });

  describe("Object utilities", () => {
    test("should sanitize user data", () => {
      const sanitizeUserData = (userData) => {
        const { password, passwordHash, ...sanitized } = userData;
        return sanitized;
      };

      const user = {
        name: "John Doe",
        email: "john@example.com",
        password: "secret123",
        role: "PATIENT",
      };

      const sanitized = sanitizeUserData(user);

      expect(sanitized).toEqual({
        name: "John Doe",
        email: "john@example.com",
        role: "PATIENT",
      });
      expect(sanitized).not.toHaveProperty("password");
    });
  });

  describe("Date utilities", () => {
    test("should format date correctly", () => {
      const formatDate = (date) => {
        return date.toISOString().split("T")[0];
      };

      const testDate = new Date("2025-01-15");
      expect(formatDate(testDate)).toBe("2025-01-15");
    });

    test("should check if date is in the future", () => {
      const isFutureDate = (date) => {
        return date > new Date();
      };

      const futureDate = new Date(Date.now() + 86400000); // +1 day
      const pastDate = new Date(Date.now() - 86400000); // -1 day

      expect(isFutureDate(futureDate)).toBe(true);
      expect(isFutureDate(pastDate)).toBe(false);
    });
  });
});
