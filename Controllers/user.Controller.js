const userService = require("../Services/user.service");
const db = require("../Configurations/db.config");
const logError = require("../utils/errorLogger");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive !== 0 && isActive !== 1) {
      return res.status(400).json({
        success: false,
        message: "isActive must be 0 or 1",
      });
    }

    const user = await userService.updateUserStatus(
      id,
      isActive
    );

    return res.status(200).json({
      success: true,
      message:
        isActive === 1
          ? "User enabled successfully"
          : "User disabled successfully",
      user,
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    logError(req, error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const profile_image = `/uploads/${req.file.filename}`;

    await db.query(
      "UPDATE users SET profile_image = ? WHERE id = ?",
      [profile_image, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profile_image,
    });
  } catch (error) {
    logError(req, error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  uploadProfilePic
};