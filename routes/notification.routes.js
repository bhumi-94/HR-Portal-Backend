const express = require("express");

const router = express.Router();

const notificationController =
  require("../Controllers/notification.controller");

const authMiddleware =
  require("../middleware/auth.middleware");

router.get(
  "/",
  authMiddleware,
  notificationController.getMyNotifications
);
router.get(
  "/unread",
  authMiddleware,
  notificationController.getUnreadNotifications
);

router.patch(
  "/:notificationId/read",
  authMiddleware,
  notificationController.markAsRead
);
router.patch(
  "/read-all",
  authMiddleware,
  notificationController.markAllAsRead
);


module.exports = router;