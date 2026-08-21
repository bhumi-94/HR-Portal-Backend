const {
  tapInService,
  tapOutService,
  getMyAttendanceService,
  getEmployeeHistory
} = require("../Services/attendance.service");

// ================= TAP IN =================

const tapIn = async (req, res) => {
  try {
    const userId = req.user.id;

    const attendanceId = await tapInService(userId);

    return res.status(200).json({
      success: true,
      message: "Tap-In successful",
      attendanceId,
    });
  } catch (error) {
    console.error("TAP IN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Tap-In",
    });
  }
};

// ================= TAP OUT =================

const tapOut = async (req, res) => {
  try {
    const userId = req.user.id;

    const attendanceId = await tapOutService(userId);

    return res.status(200).json({
      success: true,
      message: "Tap-Out successful",
      attendanceId,
    });
  } catch (error) {
    console.error("TAP OUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Tap-Out",
    });
  }
};

// ================= GET MY ATTENDANCE =================

const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const attendance = await getMyAttendanceService(userId);

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("GET ATTENDANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance",
    });
  }
};

const getEmployeeHistoryController = async (req, res) => {
  try {
    const history = await getEmployeeHistory();

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("EMPLOYEE HISTORY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  tapIn,
  tapOut,
  getMyAttendance,
  getEmployeeHistoryController
};