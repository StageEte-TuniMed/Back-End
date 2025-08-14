/**
 * Test Setup Configuration
 * This file runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = 3002; // Different port for testing
process.env.JWT_SECRET = "test_jwt_secret_key_for_testing_only";
process.env.MONGODB_URI = "mongodb://localhost:27017/tunimed_test";

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  // Uncomment to silence logs during testing
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
