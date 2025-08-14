// services/videoCallService.js
const { v4: uuidv4 } = require("uuid");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Initiate a video call
 */
const initiateVideoCall = async (chatRoomId, initiatorId, io) => {
  try {
    console.log("🎬 initiateVideoCall - chatRoomId:", chatRoomId);
    console.log("🎬 initiateVideoCall - initiatorId:", initiatorId);

    // Verify chat room exists and user has access
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      console.log("❌ initiateVideoCall - Chat room not found");
      throw new Error("Chat room not found");
    }

    console.log("✅ initiateVideoCall - Chat room found:", chatRoom._id);

    const isDoctor = chatRoom.doctorId.toString() === initiatorId.toString();

    // Check if user is the patient (either by patientId or by matching email in patientInfo)
    let isPatient = false;
    if (
      chatRoom.patientId &&
      chatRoom.patientId.toString() === initiatorId.toString()
    ) {
      isPatient = true;
      console.log("✅ initiateVideoCall - User is registered patient");
    } else {
      // For guest appointments, check if the user's email matches the chat room's patientInfo.email
      const currentUser = await User.findById(initiatorId);
      console.log("🔍 initiateVideoCall - Current user:", currentUser?.email);
      console.log(
        "🔍 initiateVideoCall - PatientInfo email:",
        chatRoom.patientInfo?.email
      );
      if (currentUser && chatRoom.patientInfo?.email === currentUser.email) {
        isPatient = true;
        console.log(
          "✅ initiateVideoCall - User is guest patient (email match)"
        );
      }
    }

    console.log("🔍 initiateVideoCall - isDoctor:", isDoctor);
    console.log("🔍 initiateVideoCall - isPatient:", isPatient);

    if (!isDoctor && !isPatient) {
      throw new Error("Unauthorized access to initiate call");
    }

    // Check if there's already an active call
    if (chatRoom.videoCallSession?.isActive) {
      // Check if the call is stuck (older than 30 minutes)
      const callAge =
        new Date() - new Date(chatRoom.videoCallSession.startedAt);
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

      if (callAge > thirtyMinutes) {
        console.log(
          "🧹 initiateVideoCall - Cleaning up stuck video call session"
        );
        chatRoom.videoCallSession.isActive = false;
        chatRoom.videoCallSession.endedAt = new Date();
        await chatRoom.save();
      } else {
        console.log(
          "❌ initiateVideoCall - Active call found, age:",
          Math.floor(callAge / 1000),
          "seconds"
        );
        throw new Error("There is already an active call in this room");
      }
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    // Update chat room with video call session
    chatRoom.videoCallSession = {
      sessionId,
      isActive: true,
      startedAt: new Date(),
      initiatedBy: initiatorId,
    };
    await chatRoom.save();

    // Get initiator info
    const initiator = await User.findById(initiatorId);

    // Create system message for call initiation
    const systemMessage = new Message({
      chatRoomId,
      senderId: initiatorId,
      senderType: initiator.role,
      messageType: "VIDEO_CALL_START",
      content: `${initiator.name} started a video call`,
      systemData: { sessionId },
    });
    await systemMessage.save();

    // Notify participants about the incoming call
    io.to(`chat-${chatRoomId}`).emit("video-call-initiated", {
      sessionId,
      initiatorId,
      initiatorName: initiator.name,
      chatRoomId,
    });

    return {
      sessionId,
      chatRoomId,
      status: "initiated",
      initiatedBy: initiatorId,
    };
  } catch (error) {
    throw new Error(`Error initiating video call: ${error.message}`);
  }
};

/**
 * Join a video call
 */
const joinVideoCall = async (sessionId, participantId, io) => {
  try {
    // Find chat room with this session
    const chatRoom = await ChatRoom.findOne({
      "videoCallSession.sessionId": sessionId,
      "videoCallSession.isActive": true,
    });

    if (!chatRoom) {
      throw new Error("Video call session not found or expired");
    }

    // Verify user has access to this chat room
    const isDoctor = chatRoom.doctorId.toString() === participantId.toString();

    // Check if user is the patient (either by patientId or by matching email in patientInfo)
    let isPatient = false;
    if (
      chatRoom.patientId &&
      chatRoom.patientId.toString() === participantId.toString()
    ) {
      isPatient = true;
    } else {
      // For guest appointments, check if the user's email matches the chat room's patientInfo.email
      const currentUser = await User.findById(participantId);
      if (currentUser && chatRoom.patientInfo?.email === currentUser.email) {
        isPatient = true;
      }
    }

    if (!isDoctor && !isPatient) {
      throw new Error("Unauthorized access to join call");
    }

    // Notify that participant joined
    const participant = await User.findById(participantId);
    io.to(`chat-${chatRoom._id}`).emit("video-call-participant-joined", {
      sessionId,
      participantId,
      participantName: participant.name,
    });

    return {
      sessionId,
      chatRoomId: chatRoom._id,
      status: "joined",
    };
  } catch (error) {
    throw new Error(`Error joining video call: ${error.message}`);
  }
};

/**
 * End a video call
 */
const endVideoCall = async (sessionId, participantId, io) => {
  try {
    // Find chat room with this session
    const chatRoom = await ChatRoom.findOne({
      "videoCallSession.sessionId": sessionId,
      "videoCallSession.isActive": true,
    });

    if (!chatRoom) {
      throw new Error("Video call session not found or already ended");
    }

    // Verify user has access to this chat room
    const isDoctor = chatRoom.doctorId.toString() === participantId.toString();

    // Check if user is the patient (either by patientId or by matching email in patientInfo)
    let isPatient = false;
    if (
      chatRoom.patientId &&
      chatRoom.patientId.toString() === participantId.toString()
    ) {
      isPatient = true;
    } else {
      // For guest appointments, check if the user's email matches the chat room's patientInfo.email
      const currentUser = await User.findById(participantId);
      if (currentUser && chatRoom.patientInfo?.email === currentUser.email) {
        isPatient = true;
      }
    }

    if (!isDoctor && !isPatient) {
      throw new Error("Unauthorized access to end call");
    }

    // Calculate call duration
    const startTime = chatRoom.videoCallSession.startedAt;
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

    // Update chat room to end the call
    chatRoom.videoCallSession.isActive = false;
    chatRoom.videoCallSession.endedAt = endTime;
    await chatRoom.save();

    // Get participant info
    const participant = await User.findById(participantId);

    // Create system message for call end
    const systemMessage = new Message({
      chatRoomId: chatRoom._id,
      senderId: participantId,
      senderType: participant.role,
      messageType: "VIDEO_CALL_END",
      content: `Video call ended (Duration: ${formatDuration(duration)})`,
      systemData: {
        sessionId,
        duration,
        endedBy: participantId,
      },
    });
    await systemMessage.save();

    // Notify participants that call ended
    io.to(`chat-${chatRoom._id}`).emit("video-call-ended", {
      sessionId,
      endedBy: participantId,
      duration,
      endedByName: participant.name,
    });

    return {
      sessionId,
      status: "ended",
      duration,
    };
  } catch (error) {
    throw new Error(`Error ending video call: ${error.message}`);
  }
};

/**
 * Get call session information
 */
const getCallSession = async (sessionId, userId) => {
  try {
    const chatRoom = await ChatRoom.findOne({
      "videoCallSession.sessionId": sessionId,
    });

    if (!chatRoom) {
      throw new Error("Call session not found");
    }

    // Verify user has access to this chat room
    const isDoctor = chatRoom.doctorId.toString() === userId.toString();

    // Check if user is the patient (either by patientId or by matching email in patientInfo)
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
      throw new Error("Unauthorized access to call session");
    }

    return {
      sessionId: chatRoom.videoCallSession.sessionId,
      isActive: chatRoom.videoCallSession.isActive,
      startedAt: chatRoom.videoCallSession.startedAt,
      endedAt: chatRoom.videoCallSession.endedAt,
      initiatedBy: chatRoom.videoCallSession.initiatedBy,
      chatRoomId: chatRoom._id,
    };
  } catch (error) {
    throw new Error(`Error getting call session: ${error.message}`);
  }
};

/**
 * Format duration in seconds to readable format
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

module.exports = {
  initiateVideoCall,
  joinVideoCall,
  endVideoCall,
  getCallSession,
};
