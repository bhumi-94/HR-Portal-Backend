const notificationService =
  require("../Services/notification.service");

const getNotifications = async (req, res) => {
  try {

    const userId = req.user.id;

    const notifications =
      await notificationService.getUserNotifications(
        userId
      );

    return res.status(200).json({
      success: true,
      notifications,
    });

  } catch (error) {

    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};

const markAsRead = async (req, res) => {
  try {

    const userId = req.user.id;

    const { notificationId } = req.params;

    await notificationService.markNotificationAsRead({
      notificationId,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });

  } catch (error) {

    console.error(
      "Mark notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};


module.exports = {
  getNotifications,
  markAsRead,
};