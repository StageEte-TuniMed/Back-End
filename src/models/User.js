const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["PATIENT", "DOCTOR", "ADMIN"],
    required: true,
  },
  specialty: {
    type: String,
    required: function () {
      return this.role === "DOCTOR";
    },
  },
  region: {
    type: String,
    required: false, // Make it optional for now to avoid breaking existing functionality
  },
  medicalHistory: {
    type: String,
    required: function () {
      return this.role === "PATIENT";
    },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
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
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);
