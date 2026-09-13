const cron = require("node-cron");
const Membership = require("../models/Membership");

const updateMembershipStatus = async () => {
  try {
    const now = new Date();

    const result = await Membership.updateMany(
      {
        status: "active",
        endDate: {
          $lte: now,
        },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    console.log(
      `Membership expiry check completed. Updated: ${result.modifiedCount}`,
    );
  } catch (error) {
    console.error("Membership cron error:", error.message);
  }
};

const startMembershipCron = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily membership expiry check...");

    await updateMembershipStatus();
  });

  // Also run once when server starts
  updateMembershipStatus();

  console.log("Membership cron job started");
};

module.exports = startMembershipCron;
