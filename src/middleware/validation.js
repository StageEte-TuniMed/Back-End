const { body, validationResult } = require("express-validator");

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("phone")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Valid phone number is required"),
  body("role")
    .isIn(["PATIENT", "DOCTOR", "ADMIN"])
    .withMessage("Role must be PATIENT, DOCTOR, or ADMIN"),
  body("specialty")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Specialty must be between 2 and 100 characters"),
  body("orderNumber")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Order number must be between 2 and 50 characters"),
  body("yearsOfExperience")
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage("Years of experience must be between 0 and 70"),
  body("acceptsCNAM")
    .optional()
    .custom((value) => {
      // Accept boolean or string representation of boolean
      if (typeof value === "boolean") return true;
      if (value === "true" || value === "false") return true;
      throw new Error("CNAM acceptance must be true or false");
    })
    .withMessage("CNAM acceptance must be true or false"),
  body("agreeToTerms")
    .custom((value) => {
      // Accept boolean or string representation of boolean
      if (typeof value === "boolean") return value === true;
      if (value === "true") return true;
      throw new Error("You must agree to the Terms of Service");
    })
    .withMessage("You must agree to the Terms of Service"),
  body("medicalHistory")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Medical history must not exceed 1000 characters"),
  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Forgot password validation
const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  handleValidationErrors,
];

// Reset password validation
const validateResetPassword = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  handleValidationErrors,
];

// Refresh token validation
const validateRefreshToken = [
  body("token").notEmpty().withMessage("Refresh token is required"),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
};
