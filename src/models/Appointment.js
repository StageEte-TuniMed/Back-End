// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Patient info for guest bookings
    patientInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    datetime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "PAID", "UNPAID"],
      default: "UNPAID",
    },
    paymentIntentId: { type: String }, // Stripe payment intent ID
    paymentAmount: { type: Number }, // Payment amount
    paymentInfo: {
      amount: Number,
      method: { type: String, enum: ["Flouci", "Stripe", "D17"] },
      status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"] },
      date: Date,
    },
    message: { type: String }, // Additional message from patient
    department: { type: String }, // Department/specialty
    chatMessages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        timestamp: Date,
      },
    ],
    videoCallInfo: {
      startedAt: Date,
      endedAt: Date,
      joinUrl: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
