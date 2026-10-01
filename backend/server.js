const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const startMembershipCron = require("./utils/membershipCron");
const startSubscriptionExpiryCron = require("./utils/subscriptionExpiryCron");

dotenv.config();

const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    startMembershipCron();
    startSubscriptionExpiryCron();
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();