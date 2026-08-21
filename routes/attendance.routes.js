const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const hrMiddleware = require("../middleware/hr.middleware");
const router = express.Router();

const {
  tapIn,
  tapOut,
  getMyAttendance,
  getEmployeeHistoryController
} = require("../Controllers/attendance.controller.js");

// Tap-In  Api
router.post("/tap-in" , authMiddleware , tapIn)

// Tap-Out  Api
router.post("/tap-out" , authMiddleware , tapOut)

// get my attendance  Api
router.get("/get-my-attendance" , authMiddleware , getMyAttendance )

// Employee history 
router.get("/employee-history", authMiddleware ,  hrMiddleware , getEmployeeHistoryController
);
module.exports = router;