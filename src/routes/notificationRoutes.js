const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} = require("../services/notificationService");

// **Get All Notifications**
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await getNotifications();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Get Notification By ID**
router.get("/notifications/:id", async (req, res) => {
  try {
    const notification = await getNotificationById(req.params.id);
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Create Notification**
router.post("/notifications", async (req, res) => {
  try {
    const notification = await createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// **Update Notification**
router.put("/notifications/:id", async (req, res) => {
  try {
    const updatedNotification = await updateNotification(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Delete Notification**
router.delete("/notifications/:id", async (req, res) => {
  try {
    const result = await deleteNotification(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
