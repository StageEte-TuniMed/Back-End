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

const app = express();
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

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/adminRoutes"));
app.use("/api/doctor-profile", require("./routes/doctorProfileRoutes"));

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
