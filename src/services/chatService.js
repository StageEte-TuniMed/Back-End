// services/chatService.js
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

/**
 * Get or create chat room for an appointment
 */
const getChatRoom = async (appointmentId, userId) => {
  try {
    console.log("🔍 getChatRoom - appointmentId:", appointmentId);
    console.log("🔍 getChatRoom - userId:", userId);

    // Find existing chat room
    let chatRoom = await ChatRoom.findOne({ appointmentId })
      .populate("doctorId", "name email role")
      .populate("patientId", "name email role")
      .populate("lastMessage");

    if (chatRoom) {
      console.log("✅ getChatRoom - Found existing chat room:", chatRoom._id);
      return chatRoom;
    }

    console.log(
      "🔍 getChatRoom - No existing chat room, fetching appointment..."
    );

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name email role")
      .populate("patientId", "name email role");

    if (!appointment) {
      console.log("❌ getChatRoom - Appointment not found");
      throw new Error("Appointment not found");
    }

    console.log("✅ getChatRoom - Appointment found:", appointment._id);
    console.log("👩‍⚕️ getChatRoom - Doctor:", appointment.doctorId?.name);
    console.log(
      "🧑‍⚕️ getChatRoom - Patient:",
      appointment.patientId?.name || appointment.patientInfo?.name
    );

    // Verify user has access to this appointment
    const isDoctor = appointment.doctorId._id.toString() === userId.toString();

    // Check if user is the patient (either by patientId or by matching email in patientInfo)
    let isPatient = false;
    if (
      appointment.patientId &&
      appointment.patientId._id.toString() === userId.toString()
    ) {
      isPatient = true;
    } else {
      // For guest appointments, check if the user's email matches patientInfo.email
      const currentUser = await User.findById(userId);
      if (currentUser && appointment.patientInfo?.email === currentUser.email) {
        isPatient = true;
      }
    }

    console.log("🔍 getChatRoom - isDoctor:", isDoctor);
    console.log("🔍 getChatRoom - isPatient:", isPatient);

    if (!isDoctor && !isPatient) {
      console.log("❌ getChatRoom - Unauthorized access");
      throw new Error("Unauthorized access to chat room");
    }

    console.log("🏗️ getChatRoom - Creating new chat room...");

    // Create new chat room
    chatRoom = new ChatRoom({
      appointmentId,
      doctorId: appointment.doctorId._id,
      patientId: appointment.patientId?._id || null,
      patientInfo: {
        name: appointment.patientId?.name || appointment.patientInfo?.name,
        email: appointment.patientId?.email || appointment.patientInfo?.email,
      },
      status: "ACTIVE",
    });

    await chatRoom.save();
    console.log("✅ getChatRoom - Chat room created:", chatRoom._id);

    // Populate the created chat room
    chatRoom = await ChatRoom.findById(chatRoom._id)
      .populate("doctorId", "name email role")
      .populate("patientId", "name email role")
      .populate("lastMessage");

    console.log("✅ getChatRoom - Chat room populated and ready");
    return chatRoom;
  } catch (error) {
    console.error("❌ getChatRoom - Error:", error.message);
    throw new Error(`Error getting chat room: ${error.message}`);
  }
};

/**
 * Get messages for a chat room
 */
const getChatMessages = async (chatRoomId, userId, page = 1, limit = 50) => {
  try {
    // Verify user has access to this chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      throw new Error("Chat room not found");
    }

    const isDoctor = chatRoom.doctorId.toString() === userId.toString();

    // Check if user is the patient (either by patientId or by matching appointment's patientInfo.email)
    let isPatient = false;
    if (
      chatRoom.patientId &&
      chatRoom.patientId.toString() === userId.toString()
    ) {
      isPatient = true;
    } else {
      // For guest appointments, check if the user's email matches the chat room's patientInfo.email
      const currentUser = await User.findById(userId);
      if (currentUser && chatRoom.patientInfo?.email === currentUser.email) {
        isPatient = true;
      }
    }

    if (!isDoctor && !isPatient) {
      throw new Error("Unauthorized access to chat messages");
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      chatRoomId,
      isDeleted: false,
    })
      .populate("senderId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({
      chatRoomId,
      isDeleted: false,
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    };
  } catch (error) {
    throw new Error(`Error getting chat messages: ${error.message}`);
  }
};

/**
 * Send a message
 */
const sendMessage = async (messageData, senderId, io) => {
  try {
    const {
      chatRoomId,
      content,
      messageType = "TEXT",
      attachments,
    } = messageData;

    // Verify user has access to this chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      throw new Error("Chat room not found");
    }

    const isDoctor = chatRoom.doctorId.toString() === senderId.toString();

    // Check if user is the patient (either by patientId or by matching chat room's patientInfo.email)
    let isPatient = false;
    if (
      chatRoom.patientId &&
      chatRoom.patientId.toString() === senderId.toString()
    ) {
      isPatient = true;
    } else {
      // For guest appointments, check if the user's email matches the chat room's patientInfo.email
      const currentUser = await User.findById(senderId);
      if (currentUser && chatRoom.patientInfo?.email === currentUser.email) {
        isPatient = true;
      }
    }

    if (!isDoctor && !isPatient) {
      throw new Error("Unauthorized access to send message");
    }

    // Get sender info
    const sender = await User.findById(senderId);
    const senderType = sender.role;

    // Create message
    const message = new Message({
      chatRoomId,
      senderId,
      senderType,
      messageType,
      content,
      attachments,
      status: "SENT",
    });

    await message.save();

    // Update chat room's last message and activity
    chatRoom.lastMessage = message._id;
    chatRoom.lastActivity = new Date();
    await chatRoom.save();

    // Populate message for response
    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "name email role"
    );

    // Emit to chat room
    io.to(`chat-${chatRoomId}`).emit("new-message", populatedMessage);

    // Send push notification to the other participant
    const recipientId = isDoctor ? chatRoom.patientId : chatRoom.doctorId;
    if (recipientId) {
      io.to(`user-${recipientId}`).emit("message-notification", {
        chatRoomId,
        message: populatedMessage,
        senderName: sender.name,
      });
    }

    return populatedMessage;
  } catch (error) {
    throw new Error(`Error sending message: ${error.message}`);
  }
};

/**
 * Mark messages as read
 */
const markMessagesAsRead = async (chatRoomId, userId) => {
  try {
    // Update all unread messages in the chat room
    await Message.updateMany(
      {
        chatRoomId,
        senderId: { $ne: userId },
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
        status: "READ",
      }
    );

    return { success: true };
  } catch (error) {
    throw new Error(`Error marking messages as read: ${error.message}`);
  }
};

/**
 * Get user's chat rooms
 */
const getUserChatRooms = async (userId, userRole) => {
  try {
    const query =
      userRole === "DOCTOR" ? { doctorId: userId } : { patientId: userId };

    const chatRooms = await ChatRoom.find({
      ...query,
      status: "ACTIVE",
    })
      .populate("doctorId", "name email role")
      .populate("patientId", "name email role")
      .populate("lastMessage")
      .populate("appointmentId", "datetime status")
      .sort({ lastActivity: -1 });

    return chatRooms;
  } catch (error) {
    throw new Error(`Error getting user chat rooms: ${error.message}`);
  }
};

module.exports = {
  getChatRoom,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getUserChatRooms,
};
