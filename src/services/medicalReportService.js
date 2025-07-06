const MedicalReport = require("../models/MedicalReport");

// **Get All Medical Reports**
const getMedicalReports = async () => {
  try {
    return await MedicalReport.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Get Medical Report By ID**
const getMedicalReportById = async (id) => {
  try {
    const report = await MedicalReport.findById(id);
    if (!report) throw new Error("Medical Report not found");
    return report;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create Medical Report**
const createMedicalReport = async (reportData) => {
  try {
    const report = new MedicalReport(reportData);
    return await report.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Update Medical Report**
const updateMedicalReport = async (id, updateData) => {
  try {
    const updatedReport = await MedicalReport.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedReport) throw new Error("Medical Report not found");
    return updatedReport;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Delete Medical Report**
const deleteMedicalReport = async (id) => {
  try {
    const deletedReport = await MedicalReport.findByIdAndDelete(id);
    if (!deletedReport) throw new Error("Medical Report not found");
    return { message: "Medical Report deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
};
