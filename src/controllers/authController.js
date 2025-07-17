// authController.js

const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    // Handle file upload for doctors
    if (req.file) {
      req.body.documentUrl = `/uploads/${req.file.filename}`;
    }

    const result = await authService.registerUser(req.body);
    res.status(201).json({
      message: "User registered successfully",
      user: result.user,
      token: result.token,
      verificationToken: result.verificationToken, // Remove this in production
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    await authService.logoutUser(req.user.id);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const newToken = await authService.refreshToken(req.body.token);
    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    await authService.sendForgotPasswordEmail(req.body.email);
    res.status(200).json({ message: "Forgot password email sent" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    await authService.resetUserPassword(req.body.token, req.body.newPassword);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    await authService.verifyUserEmail(req.params.token);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
