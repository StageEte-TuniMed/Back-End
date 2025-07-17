const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT token verification middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log(
      "🔍 authenticateToken - Headers:",
      req.headers.authorization
        ? "Authorization header present"
        : "No authorization header"
    );

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      console.log("❌ authenticateToken - No token provided");
      return res.status(401).json({ error: "Access token required" });
    }

    console.log("🔑 authenticateToken - Token found, verifying...");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      "✅ authenticateToken - Token decoded, userId:",
      decoded.userId
    );

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(
        "❌ authenticateToken - User not found for ID:",
        decoded.userId
      );
      return res.status(401).json({ error: "User not found" });
    }

    console.log("👤 authenticateToken - User found:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    console.log("✅ authenticateToken - Authentication successful");
    next();
  } catch (error) {
    console.log("❌ authenticateToken - Error:", error.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Role-based authorization middleware
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    console.log("🛡️ authorizeRole - Required roles:", roles);
    console.log(
      "👤 authorizeRole - User:",
      req.user ? { id: req.user.id, role: req.user.role } : "No user"
    );

    if (!req.user) {
      console.log("❌ authorizeRole - No user in request");
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      console.log(
        "❌ authorizeRole - Role mismatch. User role:",
        req.user.role,
        "Required roles:",
        roles
      );
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    console.log("✅ authorizeRole - Authorization successful");
    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  optionalAuth,
};
