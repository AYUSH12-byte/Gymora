const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const startMembershipCron = require("./utils/membershipCron");


dotenv.config();

const PORT = process.env.PORT || 7000;

// Connect database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start membership cron job
startMembershipCron();