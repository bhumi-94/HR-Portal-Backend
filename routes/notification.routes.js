const express = require("express");

const router = express.Router();

const notificationController =
  require("../Controllers/notification.controller");

const authMiddleware =
  require("../Middleware/auth.middleware");


// GET ALL MY NOTIFICATIONS

router.get(
  "/",
  authMiddleware,
  notificationController.getMyNotifications
);


// GET UNREAD NOTIFICATIONS

router.get(
  "/unread",
  authMiddleware,
  notificationController.getUnreadNotifications
);


// MARK ONE AS READ

router.patch(
  "/:notificationId/read",
  authMiddleware,
  notificationController.markAsRead
);


// MARK ALL AS READ

router.patch(
  "/read-all",
  authMiddleware,
  notificationController.markAllAsRead
);


module.exports = router;