const cron = require("node-cron");
const Membership = require("../models/Membership");
const Notification = require("../models/Notification");

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
      }
    );

    console.log(
      `Membership expiry check completed. Updated: ${result.modifiedCount}`
    );
  } catch (error) {
    console.error(
      "Membership cron error:",
      error.message
    );
  }
};

const createExpiryReminders = async () => {
  try {
    const now = new Date();

    const next7Days = new Date();
    next7Days.setDate(
      next7Days.getDate() + 7
    );

    const memberships = await Membership.find({
      status: "active",
      endDate: {
        $gte: now,
        $lte: next7Days,
      },
    }).populate({
      path: "member",
      populate: {
        path: "user",
      },
    });

    for (const membership of memberships) {
      const memberUser = membership.member?.user;

      if (!memberUser) {
        continue;
      }

      const existingNotification =
        await Notification.findOne({
          user: memberUser._id,
          type: "membership_expiring",
          relatedId: membership._id,
          createdAt: {
            $gte: new Date(
              new Date().setHours(0, 0, 0, 0)
            ),
          },
        });

      if (existingNotification) {
        continue;
      }

      const remainingDays = Math.ceil(
        (membership.endDate - now) /
          (1000 * 60 * 60 * 24)
      );

      await Notification.create({
        user: memberUser._id,
        type: "membership_expiring",
        title: "Membership Expiring Soon",
        message: `Your gym membership will expire in ${remainingDays} day(s). Please renew your membership.`,
        relatedId: membership._id,
      });
    }

    console.log(
      `Expiry reminders checked. Found: ${memberships.length}`
    );
  } catch (error) {
    console.error(
      "Expiry reminder error:",
      error.message
    );
  }
};

const startMembershipCron = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log(
        "Running daily membership tasks..."
      );

      await updateMembershipStatus();
      await createExpiryReminders();
    }
  );

  updateMembershipStatus();
  createExpiryReminders();

  console.log(
    "Membership cron job started"
  );
};

module.exports = startMembershipCron;