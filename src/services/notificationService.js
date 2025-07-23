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

// **Get Notifications for User**
const getNotificationsByUserId = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("appointmentId", "datetime status")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Mark Notification as Read**
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new Error("Notification not found");
    return notification;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Mark All Notifications as Read**
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create Appointment Notification**
const createAppointmentNotification = async (
  doctorId,
  appointmentData,
  type = "APPOINTMENT_BOOKED"
) => {
  try {
    const appointmentDate = new Date(appointmentData.datetime);

    let title, content;
    switch (type) {
      case "APPOINTMENT_BOOKED":
        title = "New Appointment Booked";
        content = `New appointment booked by ${appointmentData.patientInfo.name} for ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        break;
      case "APPOINTMENT_CANCELLED":
        title = "Appointment Cancelled";
        content = `Appointment with ${appointmentData.patientInfo.name} has been cancelled`;
        break;
      default:
        title = "Appointment Update";
        content = `Appointment update for ${appointmentData.patientInfo.name}`;
    }

    const notificationData = {
      userId: doctorId,
      type,
      title,
      content,
      appointmentId: appointmentData._id,
      patientInfo: appointmentData.patientInfo,
      metadata: {
        appointmentDate: appointmentDate,
        appointmentTime: appointmentDate.toTimeString().substring(0, 5),
      },
    };

    return await createNotification(notificationData);
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
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  createAppointmentNotification,
};
