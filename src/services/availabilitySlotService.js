const AvailabilitySlot = require("../models/AvailabilitySlot");

// **Get All Availability Slots**
const getAvailabilitySlots = async (doctorId = null) => {
  try {
    const query = doctorId ? { doctorId } : {};
    return await AvailabilitySlot.find(query).populate(
      "doctorId",
      "name email"
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Get Availability Slot By ID**
const getAvailabilitySlotById = async (id) => {
  try {
    const slot = await AvailabilitySlot.findById(id);
    if (!slot) throw new Error("Availability Slot not found");
    return slot;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create Availability Slot**
const createAvailabilitySlot = async (slotData) => {
  try {
    const slot = new AvailabilitySlot(slotData);
    return await slot.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Update Availability Slot**
const updateAvailabilitySlot = async (id, updateData) => {
  try {
    const updatedSlot = await AvailabilitySlot.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedSlot) throw new Error("Availability Slot not found");
    return updatedSlot;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Delete Availability Slot**
const deleteAvailabilitySlot = async (id) => {
  try {
    const deletedSlot = await AvailabilitySlot.findByIdAndDelete(id);
    if (!deletedSlot) throw new Error("Availability Slot not found");
    return { message: "Availability Slot deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Mark Availability Slot as Booked**
const markSlotAsBooked = async (doctorId, date, startTime) => {
  try {
    const slot = await AvailabilitySlot.findOne({
      doctorId,
      date: new Date(date),
      startTime,
    });

    if (slot) {
      slot.isBooked = true;
      await slot.save();
      return slot;
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Mark Availability Slot as Available (for cancellations)**
const markSlotAsAvailable = async (doctorId, date, startTime) => {
  try {
    const slot = await AvailabilitySlot.findOne({
      doctorId,
      date: new Date(date),
      startTime,
    });

    if (slot) {
      slot.isBooked = false;
      await slot.save();
      return slot;
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAvailabilitySlots,
  getAvailabilitySlotById,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  markSlotAsBooked,
  markSlotAsAvailable,
};
