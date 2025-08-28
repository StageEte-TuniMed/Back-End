// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "APPOINTMENT_REMINDER",
      "APPOINTMENT_BOOKED",
      "APPOINTMENT_CANCELLED",
      "PAYMENT_ALERT",
      "AI_RESULT",
      "PROBLEM_REPORT",
    ],
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  patientInfo: {
    name: String,
    email: String,
    phone: String,
  },
  metadata: {
    appointmentDate: Date,
    appointmentTime: String,
  },
  timestamp: { type: Date, default: Date.now },
});

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
