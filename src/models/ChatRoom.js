// models/ChatRoom.js
const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // One chat room per appointment
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Null for guest appointments
    },
    patientInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "CLOSED"],
      default: "ACTIVE",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Video call session tracking
    videoCallSession: {
      sessionId: String,
      isActive: { type: Boolean, default: false },
      startedAt: Date,
      endedAt: Date,
      initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
chatRoomSchema.index({ appointmentId: 1 });
chatRoomSchema.index({ doctorId: 1, status: 1 });
chatRoomSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
