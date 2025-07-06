// authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const emailService = require("./emailService");

const registerUser = async (userData) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    specialty,
    region,
    medicalHistory,
  } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user object
  const userObj = {
    name,
    email,
    passwordHash,
    phone,
    role,
  };

  // Add conditional fields
  if (role === "DOCTOR") {
    if (specialty) {
      userObj.specialty = specialty;
    }
    if (region) {
      userObj.region = region;
    }
  }
  if (role === "PATIENT" && medicalHistory) {
    userObj.medicalHistory = medicalHistory;
  }

  // Save user to database
  const user = new User(userObj);
  await user.save();

  // Generate email verification token
  const verificationToken = jwt.sign(
    { userId: user._id, email: user.email, purpose: "email-verification" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Send verification email
  try {
    await emailService.sendVerificationEmail(email, verificationToken, name);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't throw error - user is still registered
  }

  // Generate access token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialty: user.specialty,
      medicalHistory: user.medicalHistory,
      isEmailVerified: user.isEmailVerified,
    },
    token,
    verificationToken, // Remove this in production
  };
};

const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Generate token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialty: user.specialty,
      medicalHistory: user.medicalHistory,
      isEmailVerified: user.isEmailVerified,
    },
    token,
  };
};

const logoutUser = async (userId) => {
  // In a real app, you might want to blacklist the token
  // For now, we'll just return success
  return { message: "Logout successful" };
};

const refreshToken = async (token) => {
  try {
    // Verify the old token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user to ensure they still exist
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return newToken;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

const sendForgotPasswordEmail = async (email) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate reset token
  const resetToken = jwt.sign(
    { userId: user._id, email: user.email, purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Send password reset email
  try {
    await emailService.sendPasswordResetEmail(email, resetToken, user.name);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }

  return { message: "Password reset email sent" };
};

const resetUserPassword = async (token, newPassword) => {
  try {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "password-reset") {
      throw new Error("Invalid token purpose");
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    user.passwordHash = passwordHash;
    await user.save();

    return { message: "Password reset successfully" };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

const verifyUserEmail = async (token) => {
  try {
    // Verify email token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "email-verification") {
      throw new Error("Invalid token purpose");
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user's email verification status
    user.isEmailVerified = true;
    await user.save();

    return { message: "Email verified successfully" };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  sendForgotPasswordEmail,
  resetUserPassword,
  verifyUserEmail,
};
