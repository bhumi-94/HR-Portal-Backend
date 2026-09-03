const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendLeaveRequestEmail = async ({
  employee,
  leaveType,
  startDate,
  endDate,
  duration,
  reason,
}) => {
  await transporter.verify();

  const employeeName =
    `${employee.firstname || ""} ${employee.lastname || ""}`.trim();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.HR_EMAIL,

    subject: `Leave Request | ${employee.employee_id} | ${employeeName}`,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #f5f3f1;
              font-family: Arial, Helvetica, sans-serif;
              color: #292524;
            }

            .email-wrapper {
              width: 100%;
              padding: 40px 0;
              background-color: #f5f3f1;
            }

            .email-container {
              width: 90%;
              max-width: 650px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid #e7e0da;
            }

            .header {
              background-color: #8b5aa8;
              padding: 25px 30px;
              color: #ffffff;
            }

            .header h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 600;
            }

            .header p {
              margin: 6px 0 0;
              font-size: 13px;
              opacity: 0.9;
            }

            .content {
              padding: 30px;
            }

            .greeting {
              font-size: 15px;
              margin-bottom: 15px;
            }

            .intro {
              font-size: 14px;
              line-height: 1.6;
              color: #57534e;
              margin-bottom: 25px;
            }

            .section-title {
              font-size: 15px;
              font-weight: 600;
              color: #292524;
              margin-bottom: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }

            th {
              background-color: #f3e8f8;
              color: #6b477d;
              text-align: left;
              padding: 12px;
              font-size: 13px;
              border: 1px solid #e4d8ea;
            }

            td {
              padding: 12px;
              font-size: 13px;
              border: 1px solid #e7e0da;
              vertical-align: top;
            }

            .label {
              width: 38%;
              background-color: #faf8f6;
              font-weight: 600;
              color: #57534e;
            }

            .value {
              color: #292524;
            }

            .status {
              display: inline-block;
              padding: 5px 12px;
              border-radius: 20px;
              background-color: #fff7ed;
              color: #c2410c;
              font-weight: 600;
              font-size: 12px;
            }

            .reason-box {
              background-color: #faf8f6;
              border-left: 4px solid #8b5aa8;
              padding: 15px;
              margin-top: 10px;
              margin-bottom: 25px;
              color: #57534e;
              font-size: 13px;
              line-height: 1.6;
            }

            .action-box {
              background-color: #f8f3fa;
              border: 1px solid #eadcf0;
              border-radius: 8px;
              padding: 15px;
              font-size: 13px;
              line-height: 1.6;
              color: #57534e;
            }

            .footer {
              border-top: 1px solid #eee7df;
              padding: 20px 30px;
              background-color: #fcfaf8;
              color: #78716c;
              font-size: 12px;
              line-height: 1.5;
            }

            .footer strong {
              color: #57534e;
            }

          </style>
        </head>

        <body>

          <div class="email-wrapper">

            <div class="email-container">

              <!-- HEADER -->

              <div class="header">

                <h1>
                  Employee Leave Request
                </h1>

                <p>
                  HR Portal | Leave Management System
                </p>

              </div>


              <!-- CONTENT -->

              <div class="content">

                <div class="greeting">
                  Dear HR Team,
                </div>

                <div class="intro">

                  A new leave request has been submitted by
                  <strong>${employeeName}</strong>.
                  Please find the request details below for your review
                  and further action.

                </div>


                <!-- EMPLOYEE INFORMATION -->

                <div class="section-title">
                  Employee Information
                </div>

                <table>

                  <tr>
                    <td class="label">
                      Employee ID
                    </td>

                    <td class="value">
                      ${employee.employee_id}
                    </td>
                  </tr>

                  <tr>
                    <td class="label">
                      Employee Name
                    </td>

                    <td class="value">
                      ${employeeName}
                    </td>
                  </tr>

                  <tr>
                    <td class="label">
                      Employee Email
                    </td>

                    <td class="value">
                      ${employee.working_email || employee.personal_email || "N/A"}
                    </td>
                  </tr>

                </table>


                <!-- LEAVE INFORMATION -->

                <div class="section-title">
                  Leave Details
                </div>

                <table>

                  <tr>
                    <td class="label">
                      Leave Type
                    </td>

                    <td class="value">
                      ${leaveType}
                    </td>
                  </tr>

                  <tr>
                    <td class="label">
                      Start Date
                    </td>

                    <td class="value">
                      ${startDate}
                    </td>
                  </tr>

                  <tr>
                    <td class="label">
                      End Date
                    </td>

                    <td class="value">
                      ${endDate}
                    </td>
                  </tr>

                  <tr>
                    <td class="label">
                      Duration
                    </td>

                    <td class="value">
                      ${duration} Day(s)
                    </td>
                  </tr>

                  <tr>
                    <td class="label">
                      Status
                    </td>

                    <td class="value">

                      <span class="status">
                        Pending Approval
                      </span>

                    </td>
                  </tr>

                </table>


                <!-- REASON -->

                <div class="section-title">
                  Reason for Leave
                </div>

                <div class="reason-box">

                  ${reason}

                </div>


                <!-- ACTION -->

                <div class="action-box">

                  <strong>Action Required:</strong>

                  <br />

                  Please review the above leave request and update
                  its status from the HR dashboard accordingly.

                </div>

              </div>


              <!-- FOOTER -->

              <div class="footer">

                Regards,<br />

                <strong>HR Portal System</strong>

                <br /><br />

                This is an automated email notification.
                Please do not reply directly to this email.

              </div>

            </div>

          </div>

        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendFeedbackEmail = async ({ employee, problem, against, hrUsers }) => {
  try {
    const hrEmails = hrUsers
      .map((hr) => hr.working_email || hr.personal_email)
      .filter(Boolean);

    // console.log("HR Users:", hrUsers);
    // console.log("HR Email Addresses:", hrEmails);

    if (hrEmails.length === 0) {
      throw new Error("No HR email address found");
    }

    // Check Gmail connection/authentication
    await transporter.verify();

    console.log("✅ Gmail transporter is ready");

    const employeeName =
      employee.fullname ||
      `${employee.firstname || ""} ${employee.lastname || ""}`.trim();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: hrEmails,
      subject: `New Employee Feedback - ${employeeName}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          background: #f5f3f1;
          padding: 30px;
        ">

          <div style="
            max-width: 650px;
            margin: auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
          ">

            <h2 style="color: #8b5aa8;">
              New Employee Feedback
            </h2>

            <p>
              <strong>Username:</strong>
              ${employeeName}
            </p>

            <p>
              <strong>Job Title:</strong>
              ${employee.job_title || "N/A"}
            </p>

            <p>
              <strong>Problem:</strong>
            </p>

            <div style="
              background: #faf8f6;
              padding: 15px;
              border-left: 4px solid #8b5aa8;
              border-radius: 6px;
            ">
              ${problem}
            </div>

            ${
              against
                ? `
                  <p style="margin-top: 20px;">
                    <strong>Against:</strong>
                  </p>

                  <div style="
                    background: #faf8f6;
                    padding: 15px;
                    border-radius: 6px;
                  ">
                    ${against}
                  </div>
                `
                : ""
            }

            <p style="
              margin-top: 25px;
              color: #78716c;
            ">
              Please review this feedback from the HR Portal.
            </p>

          </div>

        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("❌ Feedback email error:", error);
    throw error;
  }
};
module.exports = {
  sendLeaveRequestEmail,
  sendFeedbackEmail,
};
