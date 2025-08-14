// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["DOCTOR", "PATIENT"],
      required: true,
    },
    messageType: {
      type: String,
      enum: [
        "TEXT",
        "IMAGE",
        "FILE",
        "SYSTEM",
        "VIDEO_CALL_START",
        "VIDEO_CALL_END",
      ],
      default: "TEXT",
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "TEXT" || this.messageType === "SYSTEM";
      },
    },
    // For file/image messages
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
      },
    ],
    // Message status
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "READ"],
      default: "SENT",
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // For system messages (call started, ended, etc.)
    systemData: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.model("Message", messageSchema);
