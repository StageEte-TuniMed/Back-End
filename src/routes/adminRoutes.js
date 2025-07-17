const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const {
  getUsersByRole,
  updateUser,
  getUsers,
} = require("../services/userService");
const {
  sendDoctorApprovalEmail,
  sendDoctorRejectionEmail,
} = require("../services/emailService");

// **Admin Statistics**
router.get(
  "/stats",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const users = await getUsers();

      const stats = {
        totalDoctors: users.filter((user) => user.role === "DOCTOR").length,
        pendingDoctors: users.filter(
          (user) => user.role === "DOCTOR" && !user.isVerifiedByAdmin
        ).length,
        approvedDoctors: users.filter(
          (user) => user.role === "DOCTOR" && user.isVerifiedByAdmin
        ).length,
        rejectedDoctors: 0, // We don't have a rejected status yet
        totalPatients: users.filter((user) => user.role === "PATIENT").length,
        totalAppointments: 0, // This would come from appointments collection
      };

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// **Get Pending Doctor Verifications**
router.get(
  "/doctor-verification/pending",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const doctors = await getUsersByRole("DOCTOR");

      // Filter pending doctors (not verified by admin)
      const pendingDoctors = doctors
        .filter((doctor) => !doctor.isVerifiedByAdmin)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
        .slice(offset, offset + limit);

      res.status(200).json({
        doctors: pendingDoctors,
        total: doctors.filter((doctor) => !doctor.isVerifiedByAdmin).length,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// **Approve Doctor**
router.put(
  "/doctor-verification/:doctorId/approve",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { notes } = req.body;

      const updatedDoctor = await updateUser(doctorId, {
        isVerifiedByAdmin: true,
        verificationNotes: notes || "Approved by admin",
        verifiedBy: req.user.id,
        verificationDate: new Date(),
      });

      // Send approval email to the doctor
      try {
        await sendDoctorApprovalEmail(
          updatedDoctor.email,
          updatedDoctor.name,
          notes
        );
        console.log(`Approval email sent to ${updatedDoctor.email}`);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Don't fail the entire operation if email fails
      }

      res.status(200).json({
        message: "Doctor approved successfully",
        doctor: updatedDoctor,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// **Reject Doctor**
router.put(
  "/doctor-verification/:doctorId/reject",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { notes } = req.body;

      const updatedDoctor = await updateUser(doctorId, {
        isVerifiedByAdmin: false,
        verificationNotes: notes || "Rejected by admin",
        verifiedBy: req.user.id,
        verificationDate: new Date(),
      });

      // Send rejection email to the doctor
      try {
        await sendDoctorRejectionEmail(
          updatedDoctor.email,
          updatedDoctor.name,
          notes
        );
        console.log(`Rejection email sent to ${updatedDoctor.email}`);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        // Don't fail the entire operation if email fails
      }

      res.status(200).json({
        message: "Doctor rejected",
        doctor: updatedDoctor,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// **Get All Doctors for Admin**
router.get(
  "/doctors",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const doctors = await getUsersByRole("DOCTOR");
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
