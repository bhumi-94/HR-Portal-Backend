const {
  tapInService,
  tapOutService,
  getMyAttendanceService,
  getEmployeeHistory,
} = require("../Services/attendance.service");
const logError = require("../utils/errorLogger");

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
    logError(req, error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Tap-In",
    });
  }
};

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
    logError(req, error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Tap-Out",
    });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const attendance = await getMyAttendanceService(userId);
    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    logError(req, error);
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
    logError(req, error);
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
  getEmployeeHistoryController,
};
