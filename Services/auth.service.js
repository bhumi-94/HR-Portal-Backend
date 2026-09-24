const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userModel = require("../models/user.model");
const sendResetEmail = require("../utils/sendEmail");
const db = require("../Configurations/db.config")

// REGISTER
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const registerUser = async ({
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
}) => {

  const fullname = `${firstname} ${lastname}`;
  const email = personal_email;

  // Check existing email
  const [existingUser] = await db.query(
    "SELECT id FROM users WHERE email = ? OR personal_email = ?",
    [personal_email, personal_email]
  );

  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }


  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
  `INSERT INTO users
  (
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
    fullname,
    email,
    password,
    profile_image
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
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
    fullname,
    email,
    hashedPassword,
    profileImage,
  ]
);

const employeeId = `SPTL${String(result.insertId).padStart(2, "0")}`;
  await db.query(
  `UPDATE users 
   SET employee_id = ?
   WHERE id = ?`,
  [employeeId, result.insertId]
);

await db.query(
  `UPDATE users
   SET profile_image = ?
   WHERE id = ?`,
  [profileImage, result.insertId]
);
  return {
    userId: result.insertId,
    employee_id: employeeId,
    fullname,
    email,
    profile_image:profileImage,
  };
};
const loginUser = async (email, password) => {
  // 1. Find user
  const [users] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  // 2. User doesn't exist
  if (users.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = users[0];

  // 3. Check whether account is active
  if (Number(user.isActive) !== 1) {
    throw new Error("Your account has been disabled by HR");
  }

  // 4. Check password
  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
  {
    id: user.id,
    role: user.role,
  },
  process.env.JWT_SECRET_KEY,
  {
    expiresIn: "7d",
  }
);
  // 6. Return user + token
  return {
    token,
    user: {
    id: user.id,
    employee_id: user.employee_id,
    firstname: user.firstname,
    fullname: user.fullname,
    lastname: user.lastname,
    username: user.username,
    email:user.email,
    role: user.role,
    profile_image: user.profile_image,
    },
  };
};

const googleLoginUser = async (credential) => {
  try {
    if (!credential) {
      throw new Error("Google credential is required");
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token");
    }

    const {
      sub,
      email,
      email_verified,
      given_name,
      family_name,
      picture,
    } = payload;

    // Google email must be verified
    if (!email_verified) {
      throw new Error("Google email is not verified");
    }

    // Find existing HR Portal user
    const [users] = await db.execute(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      throw new Error(
        "No HR Portal account found for this Google email. Please contact HR."
      );
    }

    const user = users[0];

    // Check whether account is active
    if (user.isActive === 0 || user.isActive === false) {
      throw new Error(
        "Your HR Portal account is inactive. Please contact HR."
      );
    }
    if (user.google_id && user.google_id !== sub) {
      throw new Error(
        "This Google account is not linked to your HR Portal account."
      );
    }
    if (!user.google_id) {
      await db.execute(
        `UPDATE users SET google_id = ? WHERE id = ?`,
        [sub, user.id]
      );

      user.google_id = sub;
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    const userResponse = {
      id: user.id,
      employee_id: user.employee_id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      personal_email: user.personal_email,
      working_email: user.working_email,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      department: user.department,
      job_title: user.job_title,
      profile_image: user.profile_image || picture || null,
      role: user.role,
      isActive: user.isActive,
    };

    return {
      token,
      user: userResponse,
    };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

// FORGOT PASSWORD
const forgotPassword = async (email) => {
  // 1. Find user
  const user =
    await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error(
      "User not found"
    );
  }
  // 2. Generate token
  const resetToken =
    crypto.randomBytes(32).toString("hex");
  // 3. Expiry = 30 minutes
  const resetTokenExpiry =
    new Date(
      Date.now() + 30 * 60 * 1000
    );
  // 4. Save token in database
  await userModel.saveResetToken(
    user.id,
    resetToken,
    resetTokenExpiry
  );
  // 5. Create FRONTEND reset URL
    const resetUrl =
    `http://localhost:5173/reset-password/${resetToken}`;
  console.log(
    "Reset URL:",
    resetUrl
  );
  // 6. Send email
  await sendResetEmail(
    email,
    resetUrl
  );
  return {
    message:
      "Reset password link sent to your email"
  };
};
// RESET PASSWORD
const resetPassword = async (
  token,
  newPassword
) => {
  // 1. Find user by token
  const user =
    await userModel.findUserByResetToken(
      token
    );
  if (!user) {
    throw new Error(
      "Invalid or expired reset token"
    );
  }
  // 2. Check token expiry
  if (
    !user.reset_token_expiry ||
    new Date(user.reset_token_expiry) < new Date()
  ) {
    throw new Error(
      "Reset token has expired"
    );
  }
  // 3. Hash new password
  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );
  // 4. Update password
  await userModel.updatePassword(
    user.id,
    hashedPassword
  );
  return {
    message:
      "Password reset successfully"
  };
};
const getCurrentUser = async (userId) => {

  const [rows] = await db.execute(
  `SELECT 
     id,
     employee_id,
     firstname,
     lastname,
     username,
     fullname,
     email,
     role,
     isActive,
     profile_image
   FROM users
   WHERE id = ?`,
  [userId]
);

  if (rows.length === 0) {
    throw new Error("User not found");
  }
  const user = rows[0];
    if (!user.isActive) {
      throw new Error(
        "Your account has been disabled. Please contact HR."
      );
    }
  return rows[0];
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  googleLoginUser
};