// routes/videoCallRoutes.js
const express = require("express");
const router = express.Router();
const {
  initiateVideoCall,
  joinVideoCall,
  endVideoCall,
  getCallSession,
} = require("../services/videoCallService");
const { authenticateToken } = require("../middleware/auth");

// Initiate video call
router.post("/initiate", authenticateToken, async (req, res) => {
  try {
    console.log("📹 Video Call Initiate Request:", {
      chatRoomId: req.body.chatRoomId,
      userId: req.user.id,
      userRole: req.user.role,
    });

    const io = req.app.get("io");
    const callSession = await initiateVideoCall(
      req.body.chatRoomId,
      req.user.id,
      io
    );

    console.log("✅ Video Call Initiated Successfully:", callSession);
    res.status(200).json(callSession);
  } catch (error) {
    console.error("❌ Video Call Initiate Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Join video call
router.post("/join", authenticateToken, async (req, res) => {
  try {
    const io = req.app.get("io");
    const result = await joinVideoCall(req.body.sessionId, req.user.id, io);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End video call
router.post("/end", authenticateToken, async (req, res) => {
  try {
    const io = req.app.get("io");
    await endVideoCall(req.body.sessionId, req.user.id, io);
    res.status(200).json({ message: "Call ended successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get call session info
router.get("/session/:sessionId", authenticateToken, async (req, res) => {
  try {
    const session = await getCallSession(req.params.sessionId, req.user.id);
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear stuck video call session
router.post("/clear-session", authenticateToken, async (req, res) => {
  try {
    const { chatRoomId } = req.body;
    const ChatRoom = require("../models/ChatRoom");

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Clear the video call session
    if (chatRoom.videoCallSession?.isActive) {
      chatRoom.videoCallSession.isActive = false;
      chatRoom.videoCallSession.endedAt = new Date();
      await chatRoom.save();

      console.log(
        "🧹 Cleared stuck video call session for chat room:",
        chatRoomId
      );
      res
        .status(200)
        .json({ message: "Video call session cleared successfully" });
    } else {
      res.status(200).json({ message: "No active video call session found" });
    }
  } catch (error) {
    console.error("❌ Error clearing video call session:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
