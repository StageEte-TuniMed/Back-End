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
  role: {
    type: String,
    enum: ["PATIENT", "DOCTOR", "ADMIN"],
    required: true,
  },
  profileImage: {
    type: String, // URL to the profile image
  },
  specialty: {
    type: String,
    required: function () {
      return this.role === "DOCTOR";
    },
  },
  // Doctor verification fields (Tunisia specific)
  orderNumber: {
    type: String,
    required: function () {
      return this.role === "DOCTOR";
    },
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness for non-null values
  },
  yearsOfExperience: {
    type: Number,
    required: false,
  },
  documentUrl: {
    type: String, // URL/path to the uploaded verification document
    required: function () {
      return this.role === "DOCTOR";
    },
  },
  // CNAM (Caisse Nationale d'Assurance Maladie) acceptance
  acceptsCNAM: {
    type: Boolean,
    required: function () {
      return this.role === "DOCTOR";
    },
    default: false,
  },
  isVerifiedByAdmin: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: function () {
      return this.role === "DOCTOR" ? "PENDING" : undefined;
    },
  },
  verificationNotes: {
    type: String, // Admin can add notes about verification
  },
  verifiedAt: {
    type: Date,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to admin who verified
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
