require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const SuperAdmin = require("../models/SuperAdmin");

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await SuperAdmin.findOne({
      email: "admin@gymora.com",
    });

    if (existingAdmin) {
      console.log("Super Admin already exists.");

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    await SuperAdmin.create({
      name: "Gymora Main Admin",
      email: "admin@gymora.com",
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    console.log("Super Admin created successfully.");

    console.log("Email: admin@gymora.com");

    console.log("Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("Create Super Admin Error:", error);

    process.exit(1);
  }
};

createSuperAdmin();
