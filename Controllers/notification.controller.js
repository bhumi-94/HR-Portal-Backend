const notificationService = require("../Services/notification.service");
const logError = require("../utils/errorLogger");

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications =
      await notificationService.getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications =
      await notificationService.getUnreadNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications",
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    await notificationService.markNotificationAsRead(
      notificationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await notificationService.markAllNotificationsAsRead(
      userId
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
};