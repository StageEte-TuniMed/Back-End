const Appointment = require("../models/Appointment");

// **Get All Appointments**
const getAppointments = async () => {
  try {
    return await Appointment.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Get Appointment By ID**
const getAppointmentById = async (id) => {
  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create Appointment**
const createAppointment = async (appointmentData) => {
  try {
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Update Appointment**
const updateAppointment = async (id, updateData) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedAppointment) throw new Error("Appointment not found");
    return updatedAppointment;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Delete Appointment**
const deleteAppointment = async (id) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    if (!deletedAppointment) throw new Error("Appointment not found");
    return { message: "Appointment deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
