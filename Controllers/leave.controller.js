const leaveService = require("../Services/leave.service");
const { sendLeaveRequestEmail } = require("../utils/email");


// CREATE LEAVE REQUEST

const requestLeave = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    // Logged-in user
    const userId = req.user.id;

    // Required fields validation

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All leave fields are required",
      });
    }

    // Leave type validation
    const allowedLeaveTypes = [
      "Sick Leave",
      "Casual Leave",
      "WFH",
    ];

    if (!allowedLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type",
      });
    }

    // Date validation

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Calculate duration

    const difference =
      end.getTime() - start.getTime();

    const duration =
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1;

    // Save leave request

    const result =
      await leaveService.createLeaveRequest({
        userId,
        leaveType,
        startDate,
        endDate,
        duration,
        reason,
      });

    // Get employee details

    const employee =
      await leaveService.getEmployeeById(userId);

    // Send email to HR

    try {
      await sendLeaveRequestEmail({
        employee,
        leaveType,
        startDate,
        endDate,
        duration,
        reason,
      });
    } catch (emailError) {
      console.error(
        "Leave saved but email failed:",
        emailError.message
      );
    }

    // Response

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: {
        leaveId: result.insertId,
        status: "Pending",
        duration,
      },
    });

  } catch (error) {
    console.error("Request leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit leave request",
      error: error.message,
    });
  }
};

// GET LEAVE SUMMARY

const getLeaveSummary = async (req, res) => {
  try {

    const userId = req.user.id;

    const summary =
      await leaveService.getLeaveSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });

  } catch (error) {

    console.error(
      "Leave summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave summary",
      error: error.message,
    });
  }
};

// GET MY LEAVE REQUESTS
const getMyLeaveRequests = async (req, res) => {
  try {

    const userId = req.user.id;

    const leaves =
      await leaveService.getMyLeaveRequests(userId);

    return res.status(200).json({
      success: true,
      data: leaves,
    });

  } catch (error) {

    console.error(
      "My leaves error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

// EXPORT
module.exports = {
  requestLeave,
  getLeaveSummary,
  getMyLeaveRequests,
};