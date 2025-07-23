const Appointment = require("../models/Appointment");
const {
  markSlotAsBooked,
  markSlotAsAvailable,
} = require("./availabilitySlotService");
const { createAppointmentNotification } = require("./notificationService");

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

// **Get Appointments By Doctor ID**
const getAppointmentsByDoctorId = async (doctorId) => {
  try {
    return await Appointment.find({ doctorId }).sort({ datetime: 1 });
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create Appointment**
const createAppointment = async (appointmentData, io = null) => {
  try {
    // Validate required fields
    if (!appointmentData.doctorId) {
      throw new Error("Doctor ID is required");
    }

    if (
      !appointmentData.patientInfo ||
      !appointmentData.patientInfo.name ||
      !appointmentData.patientInfo.email
    ) {
      throw new Error("Patient name and email are required");
    }

    if (!appointmentData.datetime) {
      throw new Error("Appointment date and time are required");
    }

    // Check if the appointment time is in the future
    const appointmentDate = new Date(appointmentData.datetime);
    const now = new Date();
    if (appointmentDate <= now) {
      throw new Error("Appointment time must be in the future");
    }

    // Check for conflicts - same doctor, same time
    const existingAppointment = await Appointment.findOne({
      doctorId: appointmentData.doctorId,
      datetime: appointmentDate,
      status: { $nin: ["CANCELLED"] },
    });

    if (existingAppointment) {
      throw new Error(
        "This time slot is already booked. Please choose a different time."
      );
    }

    // Create the appointment
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    // Mark the corresponding availability slot as booked
    const appointmentTime = appointmentDate.toTimeString().substring(0, 5);
    const appointmentDateOnly = appointmentDate.toISOString().split("T")[0];

    try {
      await markSlotAsBooked(
        appointmentData.doctorId,
        appointmentDateOnly,
        appointmentTime
      );

      // Emit real-time availability update
      if (io) {
        io.to(`availability-${appointmentData.doctorId}`).emit(
          "availability-updated",
          {
            doctorId: appointmentData.doctorId,
            date: appointmentDateOnly,
            time: appointmentTime,
            action: "booked",
          }
        );
      }
    } catch (slotError) {
      console.log(
        "No availability slot found to mark as booked:",
        slotError.message
      );
      // This is not critical - appointment can still be created without availability slot
    }

    // Create notification for the doctor only if no payment is required or appointment is free
    const requiresPayment =
      appointmentData.consultationFee && appointmentData.consultationFee > 0;

    if (!requiresPayment) {
      try {
        await createAppointmentNotification(
          appointmentData.doctorId,
          savedAppointment
        );

        // Emit real-time notification to doctor
        if (io) {
          io.to(`doctor-${appointmentData.doctorId}`).emit(
            "new-appointment-notification",
            {
              type: "APPOINTMENT_BOOKED",
              message: `New appointment booked by ${appointmentData.patientInfo.name}`,
              appointment: savedAppointment,
              timestamp: new Date(),
            }
          );
        }
      } catch (notificationError) {
        console.log(
          "Failed to create appointment notification:",
          notificationError.message
        );
        // This is not critical - appointment is still successfully created
      }
    } else {
      console.log(
        `Appointment created but notification delayed - payment required for appointment ${savedAppointment._id}`
      );
    }

    return savedAppointment;
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
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error("Appointment not found");

    // Mark the corresponding availability slot as available again
    const appointmentDate = new Date(appointment.datetime);
    const appointmentTime = appointmentDate.toTimeString().substring(0, 5);
    const appointmentDateOnly = appointmentDate.toISOString().split("T")[0];

    try {
      await markSlotAsAvailable(
        appointment.doctorId,
        appointmentDateOnly,
        appointmentTime
      );
    } catch (slotError) {
      console.log(
        "No availability slot found to mark as available:",
        slotError.message
      );
    }

    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    return { message: "Appointment deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  getAppointmentsByDoctorId,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
