/**
 * User Service Tests
 * Tests for user-related business logic
 */

const userService = require("../services/userService");

// Mock the User model to avoid database dependencies
jest.mock("../models/User");
const User = require("../models/User");

// Mock bcrypt to avoid actual hashing in tests
jest.mock("bcrypt");
const bcrypt = require("bcrypt");

describe("User Service", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    test("should return all users", async () => {
      // Mock data
      const mockUsers = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "PATIENT",
        },
        {
          _id: "2",
          name: "Dr. Smith",
          email: "smith@example.com",
          role: "DOCTOR",
        },
      ];

      // Mock User.find() to return mock data
      User.find.mockResolvedValue(mockUsers);

      // Call the service
      const result = await userService.getUsers();

      // Assertions
      expect(User.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    test("should throw error when database query fails", async () => {
      // Mock User.find() to throw an error
      User.find.mockRejectedValue(new Error("Database connection failed"));

      // Call the service and expect error
      await expect(userService.getUsers()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("getUsersByRole", () => {
    test("should return users with specific role", async () => {
      const mockDoctors = [
        {
          _id: "1",
          name: "Dr. Smith",
          email: "smith@example.com",
          role: "DOCTOR",
        },
        {
          _id: "2",
          name: "Dr. Johnson",
          email: "johnson@example.com",
          role: "DOCTOR",
        },
      ];

      User.find.mockResolvedValue(mockDoctors);

      const result = await userService.getUsersByRole("DOCTOR");

      expect(User.find).toHaveBeenCalledWith({ role: "DOCTOR" });
      expect(result).toEqual(mockDoctors);
      expect(result).toHaveLength(2);
    });

    test("should return empty array when no users found for role", async () => {
      User.find.mockResolvedValue([]);

      const result = await userService.getUsersByRole("ADMIN");

      expect(User.find).toHaveBeenCalledWith({ role: "ADMIN" });
      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    test("should return user when found", async () => {
      const mockUser = {
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
      };
      User.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById("123");

      expect(User.findById).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockUser);
    });

    test("should throw error when user not found", async () => {
      User.findById.mockResolvedValue(null);

      await expect(userService.getUserById("nonexistent")).rejects.toThrow(
        "User not found"
      );
    });

    test("should throw error when database query fails", async () => {
      User.findById.mockRejectedValue(new Error("Database error"));

      await expect(userService.getUserById("123")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("createUser", () => {
    test("should create user with hashed password", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "plainPassword123",
      };

      const hashedPassword = "hashedPassword123";
      const mockSavedUser = {
        ...userData,
        password: hashedPassword,
        _id: "123",
      };

      // Mock bcrypt functions
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Mock User constructor and save
      const mockSave = jest.fn().mockResolvedValue(mockSavedUser);
      User.mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await userService.createUser(userData);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("plainPassword123", "salt");
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSavedUser);
    });

    test("should create user without password", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
      };

      const mockSavedUser = { ...userData, _id: "123" };
      const mockSave = jest.fn().mockResolvedValue(mockSavedUser);
      User.mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await userService.createUser(userData);

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    test("should throw error when user creation fails", async () => {
      const userData = { name: "John Doe", email: "john@example.com" };

      const mockSave = jest
        .fn()
        .mockRejectedValue(new Error("Validation failed"));
      User.mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Validation failed"
      );
    });
  });
});
