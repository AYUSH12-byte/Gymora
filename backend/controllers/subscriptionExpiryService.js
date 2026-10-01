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
        `Subscription expiry check: ${result.modifiedCount} subscription(s) marked as expired`,
      );
    }

    return result.modifiedCount;
  } catch (error) {
    console.error(
      "Subscription expiry service error:",
      error,
    );

    return 0;
  }
};

module.exports = {
  expireSubscriptions,
};