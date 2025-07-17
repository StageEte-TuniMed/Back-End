const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../utils/fileUpload");
const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
} = require("../middleware/validation");

// Authentication routes
// POST /auth/register - User registration (with optional file upload for doctors)
router.post(
  "/register",
  upload.single("document"),
  validateRegistration,
  authController.register
);

// POST /auth/login - User login
router.post("/login", validateLogin, authController.login);

// POST /auth/logout - User logout (requires authentication)
router.post("/logout", authenticateToken, authController.logout);

// POST /auth/refresh - Refresh token
router.post("/refresh", validateRefreshToken, authController.refresh);

// POST /auth/forgot-password - Forgot password
router.post(
  "/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);

// POST /auth/reset-password - Reset password
router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetPassword
);

// GET /auth/verify-email/:token - Verify email
router.get("/verify-email/:token", authController.verifyEmail);

// Test email configuration (remove in production)
router.post("/test-email", async (req, res) => {
  try {
    const emailService = require("../services/emailService");
    await emailService.testEmailConfig();
    res.json({ message: "Email configuration is working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
