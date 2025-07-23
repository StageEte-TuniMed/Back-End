const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
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

// **Get Notifications for User**
router.get("/notifications/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, unreadOnly } = req.query;

    const options = {};
    if (page) options.page = parseInt(page);
    if (limit) options.limit = parseInt(limit);
    if (unreadOnly === "true") options.unreadOnly = true;

    const result = await getNotificationsByUserId(userId, options);
    res.status(200).json(result);
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

// **Mark Notification as Read**
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    let { userId } = req.body;

    // If userId is not provided in body, try to get the notification first to extract userId
    if (!userId) {
      const notification = await getNotificationById(req.params.id);
      if (notification && notification.userId) {
        userId = notification.userId;
      } else {
        return res
          .status(400)
          .json({
            message: "User ID is required to mark notification as read",
          });
      }
    }

    const updatedNotification = await markAsRead(req.params.id, userId);
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Alternative route for marking as read (GET method for simpler frontend calls)**
router.get("/notifications/:id/read", async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Check if this is a valid MongoDB ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      // If it's not a valid ObjectId, it's likely a frontend timestamp-based notification
      // These are local notifications that don't exist in the database
      console.log(
        `Frontend timestamp notification ID received: ${notificationId} - ignoring backend call`
      );

      return res.status(200).json({
        message: "Local notification processed",
        id: notificationId,
        isLocal: true,
        timestamp: Date.now(),
      });
    }

    // Handle actual database notifications
    const notification = await getNotificationById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ message: "Database notification not found" });
    }

    const updatedNotification = await markAsRead(
      notificationId,
      notification.userId
    );
    res.status(200).json({
      ...updatedNotification.toObject(),
      isLocal: false,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: error.message });
  }
});

// **Mark All Notifications as Read**
router.patch("/notifications/user/:userId/read-all", async (req, res) => {
  try {
    const result = await markAllAsRead(req.params.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
