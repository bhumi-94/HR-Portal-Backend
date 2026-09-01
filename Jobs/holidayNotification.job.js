const cron = require("node-cron");
const db = require("../Configurations/db.config");
const notificationService = require("../Services/notification.service");

const sendHolidayNotifications = async () => {
  try {
    // Find today's holiday
    const [holidays] = await db.execute(`
      SELECT *
      FROM holidays
      WHERE holiday_date = CURDATE()
    `);

    if (holidays.length === 0) {
      return;
    }

    // Get all active users
    const [users] = await db.execute(`
      SELECT id
      FROM users
      WHERE isActive = 1
    `);

    // Send notification to everyone
    for (const holiday of holidays) {
      for (const user of users) {
        await notificationService.createNotification({
          userId: user.id,
          type: "HOLIDAY",
          title: "Holiday Today 🎉",
          message: `${holiday.occasion} is today.`,
        });
      }
    }
  } catch (error) {
    console.error("Holiday notification error:", error);
  }
};

// Run every day at 12:01 AM
cron.schedule("1 0 * * *", () => {
  console.log("Checking today's holiday...");

  sendHolidayNotifications();
});
