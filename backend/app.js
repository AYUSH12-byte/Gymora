const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const packageRoutes = require("./routes/packageRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const workoutPlanRoutes = require("./routes/workoutPlanRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const profileRoutes = require("./routes/profileRoutes");
const memberPortalRoutes = require("./routes/memberPortalRoutes");
const adminRoutes = require("./routes/adminRoutes");
const memberPurchaseRoutes = require("./routes/memberPurchaseRoutes");
const memberPaymentRoutes = require("./routes/memberPaymentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/member-portal", memberPortalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/member-purchase", memberPurchaseRoutes);
app.use("/api/member-payments", memberPaymentRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Gym Management System API is running",
  });
});

module.exports = app;
