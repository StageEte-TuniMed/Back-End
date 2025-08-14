const mongoose = require("mongoose");
const ChatRoom = require("./src/models/ChatRoom");

async function clearStuckSession() {
  try {
    await mongoose.connect("mongodb://localhost:27017/TuniMedDB");
    console.log("Connected to MongoDB");

    // Find and update the chat room to clear video call session
    const result = await ChatRoom.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId("688ddb33d2cdf5cc94173565") },
      {
        $unset: {
          videoCallSession: 1,
        },
      },
      { new: true }
    );

    console.log(
      "Clear session result:",
      result ? "Chat room found and cleared" : "Chat room not found"
    );

    // Also try with string ID
    const result2 = await ChatRoom.findOneAndUpdate(
      { _id: "688ddb33d2cdf5cc94173565" },
      {
        $unset: {
          videoCallSession: 1,
        },
      },
      { new: true }
    );

    console.log(
      "Clear session result (string ID):",
      result2 ? "Chat room found and cleared" : "Chat room not found"
    );

    // List all chat rooms to find the correct ID
    const allRooms = await ChatRoom.find({}).select(
      "_id appointmentId videoCallSession"
    );
    console.log("All chat rooms:", allRooms);

    await mongoose.disconnect();
    console.log("✅ Session cleanup completed");
  } catch (error) {
    console.error("❌ Error clearing session:", error);
    process.exit(1);
  }
}

clearStuckSession();
