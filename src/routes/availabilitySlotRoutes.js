const express = require("express");
const router = express.Router();
const {
  getAvailabilitySlots,
  getAvailabilitySlotById,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  markSlotAsBooked,
  markSlotAsAvailable,
} = require("../services/availabilitySlotService");

// **Get All Availability Slots**
router.get("/availability-slots", async (req, res) => {
  try {
    const { doctorId } = req.query;
    const slots = await getAvailabilitySlots(doctorId);
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Availability Slot By ID**
router.get("/availability-slots/:id", async (req, res) => {
  try {
    const slot = await getAvailabilitySlotById(req.params.id);
    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Availability Slots by Doctor ID**
router.get("/availability-slots/doctor/:doctorId", async (req, res) => {
  try {
    const slots = await getAvailabilitySlots(req.params.doctorId);
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Create Availability Slot**
router.post("/availability-slots", async (req, res) => {
  try {
    const slot = await createAvailabilitySlot(req.body);
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Update Availability Slot**
router.put("/availability-slots/:id", async (req, res) => {
  try {
    const updatedSlot = await updateAvailabilitySlot(req.params.id, req.body);
    res.status(200).json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Delete Availability Slot**
router.delete("/availability-slots/:id", async (req, res) => {
  try {
    const result = await deleteAvailabilitySlot(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Mark Slot as Booked**
router.patch("/availability-slots/book", async (req, res) => {
  try {
    const { doctorId, date, startTime } = req.body;
    const result = await markSlotAsBooked(doctorId, date, startTime);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Availability slot not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Mark Slot as Available**
router.patch("/availability-slots/unbook", async (req, res) => {
  try {
    const { doctorId, date, startTime } = req.body;
    const result = await markSlotAsAvailable(doctorId, date, startTime);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Availability slot not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
