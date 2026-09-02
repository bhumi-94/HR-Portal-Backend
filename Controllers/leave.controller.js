const leaveService = require("../Services/leave.service");
const { sendLeaveRequestEmail } = require("../utils/email");
const notificationService = require("../Services/notification.service");

// CREATE LEAVE REQUEST - EMPLOYEE

const requestLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Logged-in user
    const userId = req.user.id;

    // REQUIRED FIELDS

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All leave fields are required",
      });
    }

    // VALIDATE LEAVE TYPE

    const allowedLeaveTypes = ["Sick Leave", "Casual Leave", "WFH"];

    if (!allowedLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type",
      });
    }

    // VALIDATE DATES

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

    // CALCULATE DURATION

    const difference = end.getTime() - start.getTime();

    const duration = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;

    // GET CURRENT LEAVE BALANCE

    const summary = await leaveService.getLeaveSummary(userId);

    // CHECK LEAVE BALANCE

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

    // SAVE LEAVE REQUEST

    const result = await leaveService.createLeaveRequest({
      userId,
      leaveType,
      startDate,
      endDate,
      duration,
      reason,
    });

    const employee = await leaveService.getEmployeeById(userId);

    console.log("Employee submitting Leave: " , employee)
    
    const hrUsers = await notificationService.getHRUsers();

    for (const hr of hrUsers) {

      console.log("hr users" , hrUsers)

      await notificationService.createNotification({
        userId: hr.id,
        type: "Leave Requests",
        title: "New Leave Requests",
        message: `${employee.firstname} ${employee.lastname} has Submitted the a ${leaveType} request.`,
        referenceId: result.insertId,
      });
    }

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
      console.error("Leave saved but email failed:", emailError.message);
    }

    // RESPONSE

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

// GET LEAVE SUMMARY - EMPLOYEE

const getLeaveSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await leaveService.getLeaveSummary(userId);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Leave summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave summary",
      error: error.message,
    });
  }
};

// GET MY LEAVE REQUESTS - EMPLOYEE

const getMyLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaves = await leaveService.getMyLeaveRequests(userId);
    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("My leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

// GET ALL LEAVE REQUESTS - HR

const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await leaveService.getAllLeaveRequests();

    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("All leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};
const approveLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;

    console.log("========== APPROVE LEAVE ==========");

    console.log("Leave ID:", leaveId);

    if (!leaveId) {
      return res.status(400).json({
        success: false,
        message: "Leave ID is required",
      });
    }
    const leave = await leaveService.getLeaveRequestById(leaveId);

    console.log("Leave request:", leave);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const result = await leaveService.approveLeaveRequest(leaveId);

    console.log("Approve result:", result);

    await notificationService.createNotification({
      userId: leave.user_id,
      type: "LEAVE_APPROVED",
      title: "Leave Approved ✅",
      message: `Your ${leave.leave_type} request has been approved by HR.`,
    });

    console.log("Approval notification created for user:", leave.user_id);

    return res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      data: result,
    });

  } catch (error) {
    console.error("Approve leave error:", error);

    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
const rejectLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;

    console.log("========== REJECT LEAVE ==========");

    console.log("Leave ID:", leaveId);

    if (!leaveId) {
      return res.status(400).json({
        success: false,
        message: "Leave ID is required",
      });
    }

    const leave = await leaveService.getLeaveRequestById(leaveId);

    console.log("Leave request:", leave);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const result = await leaveService.rejectLeaveRequest(leaveId);

    console.log("Reject result:", result);

    await notificationService.createNotification({
      userId: leave.user_id,

      type: "LEAVE_REJECTED",

      title: "Leave Rejected ❌",

      message: `Your ${leave.leave_type} request has been rejected by HR.`,
    });

    console.log("Rejection notification created for user:", leave.user_id);

    return res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
      data: result,
    });
  } catch (error) {
    console.error("Reject leave error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getUserLeaveHistory = async (req, res) => {
  try {
    console.log("========== HISTORY API START ==========");
    console.log("REQ.USER:", req.user);

    const userId = req.user.id;
    console.log("USER ID:", userId);
    console.log("Calling leaveService.getMyLeaveRequests...");

    const history = await leaveService.getMyLeaveRequests(userId);
    console.log("SERVICE COMPLETED");
    console.log("HISTORY:", history);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("HISTORY API ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// EXPORT

module.exports = {
  requestLeave,
  getLeaveSummary,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getUserLeaveHistory,
};
