const mongoose = require("mongoose");
require("dotenv").config();

const MembershipPackage = require("../models/MembershipPackage");
const Gym = require("../models/Gym");

const migrateMembershipPackagesToGym = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const gym = await Gym.findOne({
      isDeleted: false,
      status: "active",
    });

    if (!gym) {
      console.log("No active gym found");
      process.exit(1);
    }

    const result = await MembershipPackage.updateMany(
      {
        $or: [{ gym: { $exists: false } }, { gym: null }],
      },
      {
        $set: {
          gym: gym._id,
        },
      },
    );

    console.log(`Gym assigned: ${gym.name}`);
    console.log(`Packages updated: ${result.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Membership package migration error:", error);

    process.exit(1);
  }
};

migrateMembershipPackagesToGym();
