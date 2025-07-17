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
    medicalHistory,
    orderNumber,
    yearsOfExperience,
    documentUrl,
    acceptsCNAM,
    agreeToTerms,
  } = userData;

  // Check if user agreed to terms
  if (!agreeToTerms || agreeToTerms === "false") {
    throw new Error(
      "You must agree to the Terms of Service to create an account"
    );
  }

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

  // Add conditional fields for doctors
  if (role === "DOCTOR") {
    if (specialty) userObj.specialty = specialty;
    if (orderNumber) userObj.orderNumber = orderNumber;
    if (yearsOfExperience)
      userObj.yearsOfExperience = parseInt(yearsOfExperience);
    if (documentUrl) userObj.documentUrl = documentUrl;
    if (acceptsCNAM !== undefined)
      userObj.acceptsCNAM = acceptsCNAM === "true" || acceptsCNAM === true;
  }

  // Add conditional fields for patients
  if (role === "PATIENT" && medicalHistory) {
    userObj.medicalHistory = medicalHistory;
  }

  // Save user to database
  let user;
  try {
    user = new User(userObj);
    await user.save();
  } catch (error) {
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        throw new Error("User already exists with this email");
      }
      if (error.keyPattern && error.keyPattern.orderNumber) {
        throw new Error(
          "A doctor is already registered with this ONMT registration number. Please verify your registration number or contact support if you believe this is an error."
        );
      }
      throw new Error("A user with this information already exists");
    }
    throw error;
  }

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
      orderNumber: user.orderNumber,
      yearsOfExperience: user.yearsOfExperience,
      documentUrl: user.documentUrl,
      acceptsCNAM: user.acceptsCNAM,
      verificationStatus: user.verificationStatus,
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

  // Check if user is verified by admin (only for doctors)
  if (user.role === "DOCTOR" && !user.isVerifiedByAdmin) {
    throw new Error(
      "Your account is pending admin verification. Please wait for approval before logging in."
    );
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
