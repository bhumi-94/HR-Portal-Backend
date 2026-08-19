const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "HR Portal - Reset Password",

    html: `
      <h2>Reset Your Password</h2>

      <p>
        You requested to reset your HR Portal password.
      </p>

      <p>
        Click the button below to create a new password:
      </p>

      <a
        href="${resetUrl}"
        style="
          display:inline-block;
          padding:12px 20px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Reset Password
      </a>

      <p>
        This link will expire in 30 minutes.
      </p>

      <p>
        If you didn't request this, you can ignore this email.
      </p>
    `,
  });
};

module.exports = sendResetEmail;