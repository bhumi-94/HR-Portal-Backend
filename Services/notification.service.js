const db = require("../Configurations/db.config");


const getHRUsers = async () => {
  const query = `
    SELECT
      id,
      firstname,
      lastname,
      working_email
    FROM users
    WHERE role = 1
    AND isActive = 1
  `;

  const [rows] = await db.execute(query);

  return rows;
};

const createNotification = async ({
  userId,
  type,
  title,
  message,
}) => {

  if (!userId) {
    throw new Error("Notification userId is required");
  }

  if (!type) {
    throw new Error("Notification type is required");
  }

  if (!title) {
    throw new Error("Notification title is required");
  }

  if (!message) {
    throw new Error("Notification message is required");
  }

  const query = `
    INSERT INTO notifications
    (
      user_id,
      type,
      title,
      message,
      is_read
    )
    VALUES (?, ?, ?, ?, 0)
  `;

  const [result] = await db.execute(query, [
    userId,
    type,
    title,
    message,
  ]);

  return {
    id: result.insertId,
    userId,
    type,
    title,
    message,
    isRead: false,
  };
};

const getUserNotifications = async (userId) => {

  const query = `
    SELECT
      id,
      user_id,
      type,
      title,
      message,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows;
};

const getUnreadNotifications = async (userId) => {

  const query = `
    SELECT
      id,
      user_id,
      type,
      title,
      message,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = ?
    AND is_read = 0
    ORDER BY created_at DESC
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows;
};

const markNotificationAsRead = async (
  notificationId,
  userId
) => {

  const query = `
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
    AND user_id = ?
  `;

  const [result] = await db.execute(query, [
    notificationId,
    userId,
  ]);

  return result;
};

const markAllNotificationsAsRead = async (userId) => {

  const query = `
    UPDATE notifications
    SET is_read = 1
    WHERE user_id = ?
  `;

  const [result] = await db.execute(query, [userId]);

  return result;
};


module.exports = {
  getHRUsers,
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};