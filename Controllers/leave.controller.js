const leaveService = require("../Services/leave.service");
const { sendLeaveRequestEmail } = require("../utils/email");

// =====================================================
// CREATE LEAVE REQUEST - EMPLOYEE
// =====================================================

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

    // ---------------------------------------------
    // REQUIRED FIELDS
    // ---------------------------------------------

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All leave fields are required",
      });
    }

    // ---------------------------------------------
    // VALIDATE LEAVE TYPE
    // ---------------------------------------------

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

    // ---------------------------------------------
    // VALIDATE DATES
    // ---------------------------------------------

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

    // ---------------------------------------------
    // CALCULATE DURATION
    // ---------------------------------------------

    const difference =
      end.getTime() - start.getTime();

    const duration =
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1;

    // ---------------------------------------------
    // GET CURRENT LEAVE BALANCE
    // ---------------------------------------------

    const summary =
      await leaveService.getLeaveSummary(userId);

    // ---------------------------------------------
    // CHECK LEAVE BALANCE
    // ---------------------------------------------

    // WFH does not use sick/casual balance

    if (leaveType === "Sick Leave") {
      if (duration > summary.sick.remaining) {
        return res.status(400).json({
          success: false,
          message: `You only have ${summary.sick.remaining} sick leave day(s) remaining`,
        });
      }
    }

    if (leaveType === "Casual Leave") {
      if (duration > summary.casual.remaining) {
        return res.status(400).json({
          success: false,
          message: `You only have ${summary.casual.remaining} casual leave day(s) remaining`,
        });
      }
    }

    // ---------------------------------------------
    // SAVE LEAVE REQUEST
    // ---------------------------------------------

    const result =
      await leaveService.createLeaveRequest({
        userId,
        leaveType,
        startDate,
        endDate,
        duration,
        reason,
      });

    // ---------------------------------------------
    // GET EMPLOYEE DETAILS
    // ---------------------------------------------

    const employee =
      await leaveService.getEmployeeById(userId);

    // ---------------------------------------------
    // SEND EMAIL TO HR
    // ---------------------------------------------

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

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------

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
    console.error(
      "Request leave error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit leave request",
      error: error.message,
    });
  }
};


// =====================================================
// GET LEAVE SUMMARY - EMPLOYEE
// =====================================================

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


// =====================================================
// GET MY LEAVE REQUESTS - EMPLOYEE
// =====================================================

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


// =====================================================
// GET ALL LEAVE REQUESTS - HR
// =====================================================

const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves =
      await leaveService.getAllLeaveRequests();

    return res.status(200).json({
      success: true,
      data: leaves,
    });

  } catch (error) {
    console.error(
      "All leaves error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};


// =====================================================
// APPROVE LEAVE REQUEST - HR
// =====================================================

const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // ---------------------------------------------
    // VALIDATE ID
    // ---------------------------------------------

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Leave ID is required",
      });
    }

    // ---------------------------------------------
    // APPROVE LEAVE
    // ---------------------------------------------

    const result =
      await leaveService.approveLeaveRequest(id);

    return res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "Approve leave error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// REJECT LEAVE REQUEST - HR
// =====================================================

const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // ---------------------------------------------
    // VALIDATE ID
    // ---------------------------------------------

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Leave ID is required",
      });
    }

    // ---------------------------------------------
    // REJECT LEAVE
    // ---------------------------------------------

    const result =
      await leaveService.rejectLeaveRequest(id);

    return res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "Reject leave error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  requestLeave,
  getLeaveSummary,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};