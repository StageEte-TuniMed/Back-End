// models/AvailabilitySlot.js
const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model("AvailabilitySlot", availabilitySlotSchema);
