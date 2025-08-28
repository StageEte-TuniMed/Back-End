/**
 * TuniMed Backend API
 *
 * @description Express.js Backend API for TuniMed medical appointment platform
 * @version 1.0.0
 * @author Nassim Khaldi
 * @license MIT
 * @copyright 2025 Nassim Khaldi
 */

require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Serve static files
app.use("/uploads", express.static("public/uploads"));

// Connect to MongoDB
connectDB();

// Make io accessible to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User authentication and room joining
  socket.on("authenticate", (userData) => {
    socket.userId = userData.userId;
    socket.userRole = userData.role;
    socket.userName = userData.name;
    console.log(`User authenticated: ${userData.name} (${userData.role})`);
  });

  // Join doctor room for notifications
  socket.on("join-doctor-room", (doctorId) => {
    socket.join(`doctor-${doctorId}`);
    console.log(`Doctor ${doctorId} joined room`);
  });

  // Join patient room for availability updates
  socket.on("join-availability-room", (doctorId) => {
    socket.join(`availability-${doctorId}`);
    console.log(`Client joined availability room for doctor ${doctorId}`);
  });

  // Chat functionality
  socket.on("join-chat-room", (chatRoomId) => {
    socket.join(`chat-${chatRoomId}`);
    console.log(`User ${socket.userId} joined chat room: ${chatRoomId}`);
  });

  socket.on("leave-chat-room", (chatRoomId) => {
    socket.leave(`chat-${chatRoomId}`);
    console.log(`User ${socket.userId} left chat room: ${chatRoomId}`);
  });

  socket.on("typing-start", (chatRoomId) => {
    socket.to(`chat-${chatRoomId}`).emit("user-typing", {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: true,
    });
  });

  socket.on("typing-stop", (chatRoomId) => {
    socket.to(`chat-${chatRoomId}`).emit("user-typing", {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: false,
    });
  });

  // Video call signaling
  socket.on("video-call-offer", (data) => {
    socket.to(`chat-${data.chatRoomId}`).emit("video-call-offer", {
      offer: data.offer,
      from: socket.userId,
      sessionId: data.sessionId,
    });
  });

  socket.on("video-call-answer", (data) => {
    socket.to(`chat-${data.chatRoomId}`).emit("video-call-answer", {
      answer: data.answer,
      from: socket.userId,
      sessionId: data.sessionId,
    });
  });

  socket.on("video-call-ice-candidate", (data) => {
    socket.to(`chat-${data.chatRoomId}`).emit("video-call-ice-candidate", {
      candidate: data.candidate,
      from: socket.userId,
      sessionId: data.sessionId,
    });
  });

  socket.on("video-call-reject", (data) => {
    socket.to(`chat-${data.chatRoomId}`).emit("video-call-rejected", {
      from: socket.userId,
      sessionId: data.sessionId,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/adminRoutes"));
app.use("/api/doctor-profile", require("./routes/doctorProfileRoutes"));
app.use("/api", require("./routes/availabilitySlotRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api", require("./routes/notificationRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/specialties", require("./routes/specialtyRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/video-call", require("./routes/videoCallRoutes"));

// Add logging middleware for problem reports
app.use("/api/problem-reports", (req, res, next) => {
  console.log(`🌐 Problem Reports API: ${req.method} ${req.path}`);
  console.log("🔗 Full URL:", req.originalUrl);
  console.log("📄 Query params:", req.query);
  next();
});

app.use("/api/problem-reports", require("./routes/problemReports"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.IO`);
});
