const mongoose = require("mongoose");

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nameEn: {
    type: String,
    required: false,
    trim: true,
  },
  category: {
    type: String,
    enum: ["MAIN", "OTHER"],
    default: "MAIN",
  },
  description: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
specialtySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
specialtySchema.index({ category: 1, sortOrder: 1 });
specialtySchema.index({ name: 1 });

module.exports = mongoose.model("Specialty", specialtySchema);
