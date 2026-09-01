const db = require("../Configurations/db.config");

const createNotification = async ({
  userId,
  type,
  title,
  message,
}) => {
  const query = `
    INSERT INTO notifications
    (user_id, type, title, message)
    VALUES (?, ?, ?, ?)
  `;

  await db.execute(query, [
    userId,
    type,
    title,
    message,
  ]);
};

const getUserNotifications = async (userId) => {
  const query = `
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows;
};

const markNotificationAsRead = async ({
  notificationId,
  userId,
}) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ?
    AND user_id = ?
  `;

  await db.execute(query, [
    notificationId,
    userId,
  ]);
};


module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
};