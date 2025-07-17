const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema({
  // Reference to the User
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // Profile completion tracking
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  profileCompletedAt: {
    type: Date,
  },

  // Cabinet/Practice Information
  cabinetAddress: {
    type: String,
    required: function () {
      return this.profileCompleted;
    },
  },
  coordinates: {
    lat: {
      type: Number,
      default: 36.8065, // Tunis default
    },
    lng: {
      type: Number,
      default: 10.1815, // Tunis default
    },
  },
  cabinetPhone: {
    type: String,
    required: function () {
      return this.profileCompleted;
    },
  },
  consultationFee: {
    type: Number,
    min: 0,
  },

  // Photos
  cabinetPhotos: [
    {
      type: String, // URLs to uploaded photos
    },
  ],

  // Working Schedule
  workingHours: {
    monday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    tuesday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    wednesday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    thursday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    friday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    saturday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "12:00" },
    },
    sunday: {
      isWorking: { type: Boolean, default: false },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "12:00" },
    },
  },
  breakTime: {
    start: { type: String, default: "12:00" },
    end: { type: String, default: "14:00" },
  },
  consultationDuration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 120,
  },

  // Services and Specializations
  services: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String },
      category: { type: String },
    },
  ],
  specializations: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String },
      description: { type: String },
    },
  ],
  acceptsEmergencies: {
    type: Boolean,
    default: false,
  },
  acceptsCNAM: {
    type: Boolean,
    default: false,
  },

  // Additional Information
  bio: {
    type: String,
    maxlength: 1000,
  },
  languages: [
    {
      code: { type: String, required: true },
      name: { type: String, required: true },
      flag: { type: String },
    },
  ],

  // Rating and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },

  // Timestamps
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
doctorProfileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Set profileCompletedAt when profileCompleted is set to true
  if (this.profileCompleted && !this.profileCompletedAt) {
    this.profileCompletedAt = Date.now();
  }

  next();
});

// Virtual to populate doctor information
doctorProfileSchema.virtual("doctor", {
  ref: "User",
  localField: "doctorId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtual fields are serialized
doctorProfileSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);
