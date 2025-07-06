const Notification = require("../models/Notification");

// **Get All Notifications**
const getNotifications = async () => {
  try {
    return await Notification.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Get Notification By ID**
const getNotificationById = async (id) => {
  try {
    const notification = await Notification.findById(id);
    if (!notification) throw new Error("Notification not found");
    return notification;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create Notification**
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    return await notification.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Update Notification**
const updateNotification = async (id, updateData) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedNotification) throw new Error("Notification not found");
    return updatedNotification;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Delete Notification**
const deleteNotification = async (id) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) throw new Error("Notification not found");
    return { message: "Notification deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};
