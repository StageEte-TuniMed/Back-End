const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile,
  completeDoctorProfile,
  getDoctorProfiles,
  getDoctorProfilesByLocation,
  searchDoctorProfiles,
} = require("../services/doctorProfileService");

// Add request logging middleware
router.use((req, res, next) => {
  console.log(`🚀 ${req.method} ${req.path} - Doctor Profile Route`);
  console.log("📋 Headers:", {
    authorization: req.headers.authorization ? "Present" : "Missing",
    contentType: req.headers["content-type"],
  });
  next();
});

// **Get Doctor Profile by Doctor ID**
router.get("/:doctorId", async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.params.doctorId);
    if (!profile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get All Doctor Profiles (Public)**
router.get("/public/all", async (req, res) => {
  try {
    const profiles = await getDoctorProfiles({ profileCompleted: true });
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Search Doctor Profiles (Public)**
router.get("/public/search", async (req, res) => {
  try {
    const { q, services, specializations, lat, lng, radius } = req.query;

    let profiles;

    if (lat && lng) {
      // Location-based search
      profiles = await getDoctorProfilesByLocation(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseFloat(radius) : 10
      );
    } else if (q) {
      // Text search
      profiles = await searchDoctorProfiles(q);
    } else {
      // Filter-based search
      const filters = { profileCompleted: true };
      if (services) filters.services = services.split(",");
      if (specializations) filters.specializations = specializations.split(",");

      profiles = await getDoctorProfiles(filters);
    }

    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Current Doctor's Profile**
router.get(
  "/",
  authenticateToken,
  authorizeRole("DOCTOR"),
  async (req, res) => {
    try {
      const profile = await getDoctorProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// **Create Doctor Profile**
router.post(
  "/",
  authenticateToken,
  authorizeRole("DOCTOR"),
  async (req, res) => {
    try {
      let profileData = {
        ...req.body,
        doctorId: req.user.id,
      };

      const profile = await createDoctorProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// **Update Doctor Profile**
router.put(
  "/",
  authenticateToken,
  authorizeRole("DOCTOR"),
  async (req, res) => {
    try {
      let profileData = { ...req.body };

      const updatedProfile = await updateDoctorProfile(
        req.user.id,
        profileData
      );
      res.status(200).json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// **Complete Doctor Profile**
router.put(
  "/complete",
  authenticateToken,
  authorizeRole("DOCTOR"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      let profileData = { ...req.body };

      console.log("📋 Raw profile data received:", profileData);

      // Validate required fields for profile completion
      const requiredFields = ["cabinetAddress", "cabinetPhone"];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Complete the doctor profile
      const completedProfile = await completeDoctorProfile(userId, profileData);

      res.status(200).json({
        message: "Profile completed successfully",
        profile: completedProfile,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// **Delete Doctor Profile**
router.delete(
  "/",
  authenticateToken,
  authorizeRole("DOCTOR", "ADMIN"),
  async (req, res) => {
    try {
      const result = await deleteDoctorProfile(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Upload cabinet photos
const upload = require("../utils/fileUpload");
router.post(
  "/photos",
  authenticateToken,
  authorizeRole("DOCTOR"),
  upload.array("cabinetPhotos", 10), // Allow up to 10 photos
  async (req, res) => {
    try {
      console.log("📸 POST /photos - Starting photo upload");
      console.log(
        "👤 User:",
        req.user ? { id: req.user.id, role: req.user.role } : "No user"
      );
      console.log(
        "📁 Files:",
        req.files ? `${req.files.length} files` : "No files"
      );
      console.log("📋 Body:", req.body);

      if (!req.files || req.files.length === 0) {
        console.log("❌ No files uploaded");
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Get URLs for uploaded files
      const baseUrl =
        process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const photoUrls = req.files.map(
        (file) => `${baseUrl}/uploads/${file.filename}`
      );

      console.log("🔗 Generated photo URLs:", photoUrls);

      // Get current profile to merge with existing photos
      console.log("🔍 Getting existing doctor profile...");
      let profile = await getDoctorProfile(req.user.id);
      console.log("📋 Existing profile:", profile ? "Found" : "Not found");

      if (!profile) {
        // Create profile if doesn't exist
        console.log("➕ Creating new doctor profile...");
        profile = await createDoctorProfile({ doctorId: req.user.id });
        console.log("✅ New profile created");
      }

      // Add new photos to existing ones
      const updatedPhotos = [...(profile.cabinetPhotos || []), ...photoUrls];
      console.log("📸 Updated photos array:", updatedPhotos);

      // Update profile with new photos
      console.log("💾 Updating profile with new photos...");
      const updatedProfile = await updateDoctorProfile(req.user.id, {
        cabinetPhotos: updatedPhotos,
      });

      console.log("✅ Photos uploaded successfully");
      res.status(200).json({
        message: "Cabinet photos uploaded successfully",
        photos: photoUrls,
        profile: updatedProfile,
      });
    } catch (error) {
      console.log("❌ Error in photo upload:", error.message);
      console.log("🔍 Error stack:", error.stack);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
