const AvailabilitySlot = require("../models/AvailabilitySlot");

// **Get All Availability Slots**
const getAvailabilitySlots = async () => {
  try {
    return await AvailabilitySlot.find();
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

module.exports = {
  getAvailabilitySlots,
  getAvailabilitySlotById,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
};
