// Utility functions
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (payload, expiresIn = "24h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate random string
const generateRandomString = (length = 32) => {
  return require("crypto").randomBytes(length).toString("hex");
};

// Sanitize user object (remove sensitive data)
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.passwordHash;
  delete userObj.__v;
  return userObj;
};

// Format success response
const successResponse = (message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data) response.data = data;
  return { response, statusCode };
};

// Format error response
const errorResponse = (message, statusCode = 400, errors = null) => {
  const response = { success: false, error: message };
  if (errors) response.errors = errors;
  return { response, statusCode };
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Validate phone number
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  generateToken,
  verifyToken,
  generateRandomString,
  sanitizeUser,
  successResponse,
  errorResponse,
  isValidEmail,
  isValidPassword,
  isValidPhone,
};
