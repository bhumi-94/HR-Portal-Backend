const express = require("express");

const router = express.Router();

const {
  submitFeedback,
  getMyFeedback,
} = require("../Controllers/feedback.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Submit feedback
router.post(
  "/submit",
  authMiddleware,
  submitFeedback
);

// Get logged-in user's feedback
router.get(
  "/my",
  authMiddleware,
  getMyFeedback
);

module.exports = router;