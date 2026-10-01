const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@powerfitness.com";
    const newPassword = "Admin@123";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Admin user not found");
      process.exit(1);
    }

    user.password = newPassword;

    await user.save();

    console.log("Gym admin password reset successfully");
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("Password reset error:", error);
    process.exit(1);
  }
};

resetPassword();
