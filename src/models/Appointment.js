// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  datetime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
    default: "PENDING"
  },
  paymentStatus: {
    type: String,
    enum: ["PAID", "UNPAID"],
    default: "UNPAID"
  },
  paymentInfo: {
    amount: Number,
    method: { type: String, enum: ["Flouci", "Stripe", "D17"] },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"] },
    date: Date
  },
  chatMessages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      timestamp: Date
    }
  ],
  videoCallInfo: {
    startedAt: Date,
    endedAt: Date,
    joinUrl: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
