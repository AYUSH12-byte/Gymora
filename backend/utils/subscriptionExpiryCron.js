const cron = require("node-cron");
const GymSubscription = require("../models/GymSubscription");

const expireSubscriptions = async () => {
  try {
    const now = new Date();

    const result = await GymSubscription.updateMany(
      {
        status: "active",
        endDate: { $lte: now },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    if (result.modifiedCount > 0) {
      console.log(
        `${result.modifiedCount} Gymora subscription(s) marked as expired`,
      );
    }
  } catch (error) {
    console.error("Subscription expiry cron error:", error);
  }
};

const startSubscriptionExpiryCron = () => {
  expireSubscriptions();

  cron.schedule("0 * * * *", async () => {
    await expireSubscriptions();
  });

  console.log("Gymora subscription expiry cron started");
};

module.exports = startSubscriptionExpiryCron;
