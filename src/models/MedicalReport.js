// models/MedicalReport.js
const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
