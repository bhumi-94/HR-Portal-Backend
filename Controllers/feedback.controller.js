const feedbackService = require("../Services/feedback.service");
const notificationService = require("../Services/notification.service");
const { sendFeedbackEmail } = require("../utils/email");
const logError = require("../utils/errorLogger");

const submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    const { problem, against } = req.body;

    if (!problem || !problem.trim()) {
      return res.status(400).json({
        success: false,
        message: "Problem is required",
      });
    }

    const employee = await feedbackService.getEmployeeById(userId);

    const feedback = await feedbackService.createFeedback({
      userId,
      username: employee.fullname,
      jobTitle: employee.job_title,
      problem: problem.trim(),
      against: against?.trim() || null,
    });

    const hrUsers = await feedbackService.getHRUsers();

    for (const hr of hrUsers) {
      await notificationService.createNotification({
        userId: hr.id,
        type: "FEEDBACK",
        title: "New Employee Feedback",
        message: `${employee.fullname} submitted new feedback.`,
      });
    }

    try {
      await sendFeedbackEmail({
        employee,
        problem: problem.trim(),
        against: against?.trim() || null,
        hrUsers,
      });
    } catch (emailError) {
      console.error("Feedback saved but email failed:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    const feedback = await feedbackService.getUserFeedback(userId);

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
    });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback,
};
