const express = require("express");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} = require("../Controllers/auth.Controller");

const authMiddleware = require("../middleware/auth.midlleware");

const upload = require("../uploads/uploads");

const {
  uploadProfilePic,
} = require("../Controllers/user.Controller");

const router = express.Router();

console.log("authMiddleware:", typeof authMiddleware);
console.log("upload:", typeof upload);
console.log("upload.single:", typeof upload?.single);
console.log("uploadProfilePic:", typeof uploadProfilePic);

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD
router.post("/reset-password", resetPassword);

// Get-me API
router.get("/me", authMiddleware, getCurrentUser);

// Upload profile picture
router.put(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePic"),
  uploadProfilePic
);

module.exports = router;