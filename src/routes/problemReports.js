const express = require("express");
const router = express.Router();
const {
  createProblemReport,
  getAllProblemReports,
  getUserProblemReports,
  getProblemReport,
  updateProblemReport,
  addComment,
  getProblemReportStats,
  deleteProblemReport,
} = require("../controllers/problemReportController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// Public routes (require authentication)
router.use(authenticateToken);

console.log("🔗 Problem Reports routes registered");

// User routes
router.post("/", createProblemReport);
router.get("/my-reports", getUserProblemReports);
router.get("/:id", getProblemReport);
router.post("/:id/comments", addComment);

// Admin routes
router.get("/admin/all", authorizeRole("ADMIN"), (req, res, next) => {
  console.log("📋 Admin all reports route hit");
  getAllProblemReports(req, res, next);
});
router.get("/stats/overview", authorizeRole("ADMIN"), (req, res, next) => {
  console.log("📊 Admin stats route hit");
  getProblemReportStats(req, res, next);
});
router.put("/:id", authorizeRole("ADMIN"), updateProblemReport);
router.delete("/:id", authorizeRole("ADMIN"), deleteProblemReport);

module.exports = router;
