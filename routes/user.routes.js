const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.midlleware");
const roleMiddleware = require("../middleware/roleMidlleware");
const upload = require("../uploads/uploads");

const {
  uploadProfilePic,
  getAllUsers,
  updateUserStatus,
} = require("../Controllers/user.Controller");

const hrMiddleware = require("../middleware/hr.middleware");

// GET ALL USERS - HR ONLY
router.get(
  "/",
  authMiddleware,
  roleMiddleware(1),
  hrMiddleware,
  getAllUsers
);

// UPDATE USER STATUS - HR ONLY
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(1),
  updateUserStatus
);

// UPLOAD PROFILE PICTURE
router.put(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePic"),
  uploadProfilePic
);

module.exports = router;