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



// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Gym Management System API is running",
  });
});

module.exports = app;