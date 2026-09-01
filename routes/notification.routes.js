const express = require("express");
const router = express.Router();

const notificationController =
  require("../Controllers/notification.controller");

const authMiddleware =
  require("../middleware/auth.middleware");


router.get(
  "/",
  authMiddleware,
  notificationController.getNotifications
);

router.patch(
  "/:notificationId/read",
  authMiddleware,
  notificationController.markAsRead
);

module.exports = router;