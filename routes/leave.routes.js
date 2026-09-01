const express = require("express");

const router = express.Router();

const {
  requestLeave,
  getLeaveSummary,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getUserLeaveHistory
} = require("../Controllers/leave.controller");

const authMiddleware = require("../middleware/auth.middleware");

// CREATE LEAVE REQUEST
// POST /api/leave/request

router.post("/request", authMiddleware, requestLeave);

// GET LEAVE SUMMARY
// GET /api/leave/summary

router.get("/summary", authMiddleware, getLeaveSummary);

// GET MY LEAVE REQUESTS
// GET /api/leave/my

router.get("/my", authMiddleware, getMyLeaveRequests);
//----------------hr dashboard routes -------------

router.get("/all", authMiddleware, getAllLeaveRequests);

// HR approves leave
router.put(
  "/:leaveId/approve",
  authMiddleware,
  approveLeaveRequest
);

router.put(
  "/:leaveId/reject",
  authMiddleware,
  rejectLeaveRequest
);

// User Leave History Route
router.get(
  "/getLeaveHistory",
  authMiddleware,
  getUserLeaveHistory
);

module.exports = router;
