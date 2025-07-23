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
