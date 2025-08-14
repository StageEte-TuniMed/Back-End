const express = require("express");
const specialtyController = require("../controllers/specialtyController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", specialtyController.getAllSpecialties);
router.get("/grouped", specialtyController.getSpecialtiesGrouped);
router.get("/:id", specialtyController.getSpecialtyById);

// Admin-only routes
router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  specialtyController.createSpecialty
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  specialtyController.updateSpecialty
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  specialtyController.deleteSpecialty
);

module.exports = router;
