// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const {
  getChatRoom,
  createChatRoom,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getUserChatRooms,
} = require("../services/chatService");
const { authenticateToken } = require("../middleware/auth");

// Get or create chat room for appointment
router.get("/chat-room/:appointmentId", authenticateToken, async (req, res) => {
  try {
    console.log(
      "🏠 Chat Room Request - appointmentId:",
      req.params.appointmentId
    );
    console.log("👤 Chat Room Request - userId:", req.user.id);

    const chatRoom = await getChatRoom(req.params.appointmentId, req.user.id);
    console.log("✅ Chat Room Retrieved:", chatRoom ? "Success" : "Not found");

    res.status(200).json(chatRoom);
  } catch (error) {
    console.error("❌ Chat Room Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a chat room
router.get("/messages/:chatRoomId", authenticateToken, async (req, res) => {
  try {
    console.log("💬 Get Messages - chatRoomId:", req.params.chatRoomId);
    console.log("👤 Get Messages - userId:", req.user.id);

    const { page = 1, limit = 50 } = req.query;
    const messages = await getChatMessages(
      req.params.chatRoomId,
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    console.log(
      "✅ Messages Retrieved:",
      messages.messages?.length || 0,
      "messages"
    );
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Get Messages Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post("/messages", authenticateToken, async (req, res) => {
  try {
    console.log("📤 Send Message - Request body:", req.body);
    console.log("👤 Send Message - userId:", req.user.id);

    const io = req.app.get("io");
    const message = await sendMessage(req.body, req.user.id, io);

    console.log("✅ Message Sent:", message._id);
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Send Message Error:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Mark messages as read
router.patch(
  "/messages/:chatRoomId/read",
  authenticateToken,
  async (req, res) => {
    try {
      await markMessagesAsRead(req.params.chatRoomId, req.user.id);
      res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get user's chat rooms
router.get("/chat-rooms", authenticateToken, async (req, res) => {
  try {
    console.log("🏠 Get Chat Rooms - userId:", req.user.id);
    console.log("👤 Get Chat Rooms - userRole:", req.user.role);

    const chatRooms = await getUserChatRooms(req.user.id, req.user.role);

    console.log("✅ Chat Rooms Retrieved:", chatRooms?.length || 0, "rooms");
    res.status(200).json(chatRooms);
  } catch (error) {
    console.error("❌ Get Chat Rooms Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
