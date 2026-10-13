const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

require("../Configurations/db.config");

const authRoutes = require("../routes/auth.routes");
const userRoutes = require("../routes/user.routes");
const attendanceRoutes = require("../routes/attendance.routes");
const leaveRoutes = require("../routes/leave.routes");
const holidayRoutes = require("../routes/holiday.routes");
const notificationRoutes = require("../routes/notification.routes");
const feedbackRoutes = require("../routes/feedback.routes");

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://hr-portal-silk-five.vercel.app"],
    credentials: true,
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Root route - Backend health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HR-Portal backend is running successfully!",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);

module.exports = app;
