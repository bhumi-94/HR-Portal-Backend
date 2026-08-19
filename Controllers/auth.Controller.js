const authService = require("../Services/auth.service");
const signupSchema = require("../Validation/signupSchema");

// REGISTER
const register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      personal_email,
      working_email,
      phone,
      address,
      gender,
      department,
      job_title,
      password
    } = req.body;

    // Get uploaded profile image
    const profileImage = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    console.log("REGISTER BODY:", req.body);
    console.log("UPLOADED FILE:", req.file);
    console.log("PROFILE IMAGE:", profileImage);

    const result = await authService.registerUser({
      firstname,
      lastname,
      username,
      personal_email,
      working_email,
      phone,
      address,
      gender,
      department,
      job_title,
      password,
      profileImage, 
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      ...result
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Registration failed"
    });
  }
};
// LOGIN


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const result = await authService.loginUser(email, password);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,

        message: "Email is required",
      });
    }
    const result = await authService.forgotPassword(email);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("RESET TOKEN:", token);
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }
    await authService.resetPassword(token, password);
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(
      req.user.id
    );
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser
};
