const express = require("express");
const router = express.Router()

const { requestLeave , getLeaveSummary , getMyLeaveRequests } = require("../Controllers/leave.controller")
const authMiddleware = require("../Middleware/auth.middleware");


router.post(
  "/request",
  authMiddleware,
  requestLeave
);

router.get(
  "/summary",
  authMiddleware,
  getLeaveSummary
);

router.get(
  "/my-leaves",
  authMiddleware,
  getMyLeaveRequests
);



module.exports = router





