const mongoose = require("mongoose");

const problemReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "technical_issue",
      "bug_report",
      "feature_request",
      "account_issue",
      "payment_issue",
      "appointment_issue",
      "other",
    ],
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed"],
    default: "open",
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  screenshotUrl: {
    type: String,
    default: null,
  },
  browserInfo: {
    userAgent: String,
    platform: String,
    url: String,
  },
  adminNotes: {
    type: String,
    default: "",
  },
  resolution: {
    type: String,
    default: "",
  },
  comments: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      isAdminReply: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
});

// Update the updatedAt field before saving
problemReportSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = Date.now();
  }
  next();
});

// Index for better performance
problemReportSchema.index({ reportedBy: 1, status: 1 });
problemReportSchema.index({ status: 1, priority: 1 });
problemReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ProblemReport", problemReportSchema);
