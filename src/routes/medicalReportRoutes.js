const express = require("express");
const router = express.Router();
const {
  getMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
} = require("../services/medicalReportService");

// **Get All Medical Reports**
router.get("/medical-reports", async (req, res) => {
  try {
    const reports = await getMedicalReports();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Medical Report By ID**
router.get("/medical-reports/:id", async (req, res) => {
  try {
    const report = await getMedicalReportById(req.params.id);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Create Medical Report**
router.post("/medical-reports", async (req, res) => {
  try {
    const report = await createMedicalReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Update Medical Report**
router.put("/medical-reports/:id", async (req, res) => {
  try {
    const updatedReport = await updateMedicalReport(req.params.id, req.body);
    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Delete Medical Report**
router.delete("/medical-reports/:id", async (req, res) => {
  try {
    const result = await deleteMedicalReport(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
