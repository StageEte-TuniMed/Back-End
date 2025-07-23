const express = require("express");
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  getAppointmentsByDoctorId,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../services/appointmentService");

// **Get All Appointments**
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await getAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Appointments By Doctor ID**
router.get("/appointments/doctor/:doctorId", async (req, res) => {
  try {
    const appointments = await getAppointmentsByDoctorId(req.params.doctorId);
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Appointment By ID**
router.get("/appointments/:id", async (req, res) => {
  try {
    const appointment = await getAppointmentById(req.params.id);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Create Appointment**
router.post("/appointments", async (req, res) => {
  try {
    const io = req.app.get("io");
    const appointment = await createAppointment(req.body, io);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Update Appointment**
router.put("/appointments/:id", async (req, res) => {
  try {
    const updatedAppointment = await updateAppointment(req.params.id, req.body);
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Delete Appointment**
router.delete("/appointments/:id", async (req, res) => {
  try {
    const result = await deleteAppointment(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
