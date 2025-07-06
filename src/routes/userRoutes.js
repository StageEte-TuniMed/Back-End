const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getUsers,
  getUsersByRole,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../services/userService");

// **Get All Users**
router.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Doctors**
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await getUsersByRole("DOCTOR");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get User By ID**
router.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Create User**
router.post("/users", async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Update User**
router.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Delete User**
router.delete("/users/:id", async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update current user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const updatedUser = await updateUser(req.user.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change user password
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user
    const user = await getUserById(req.user.id);

    // Check if current password is correct
    const bcrypt = require("bcrypt");
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await updateUser(req.user.id, { passwordHash: newPasswordHash });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload profile image
const upload = require("../utils/fileUpload");
router.post(
  "/profile/image",
  authenticateToken,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the URL for the uploaded file
      const baseUrl =
        process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const profileImage = `${baseUrl}/uploads/${req.file.filename}`;

      // Update user with new profile image URL
      const updatedUser = await updateUser(req.user.id, { profileImage });

      res.status(200).json({
        message: "Profile image uploaded successfully",
        profileImage,
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
