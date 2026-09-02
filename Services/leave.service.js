const db = require("../Configurations/db.config");

// CREATE LEAVE REQUEST

const createLeaveRequest = async ({
  userId,
  leaveType,
  startDate,
  endDate,
  duration,
  reason,
}) => {
  const query = `
    INSERT INTO leave_requests
    (
      user_id,
      leave_type,
      start_date,
      end_date,
      duration,
      reason,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, 'Pending')
  `;

  const [result] = await db.execute(query, [
    userId,
    leaveType,
    startDate,
    endDate,
    duration,
    reason,
  ]);

  return result;
};

// GET EMPLOYEE

const getEmployeeById = async (userId) => {
  const query = `
    SELECT
      id,
      employee_id,
      firstname,
      lastname,
      working_email,
      personal_email
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows[0];
};

const getLeaveBalance = async (userId) => {
  const insertQuery = `
    INSERT INTO leave_balances
    (
      user_id,
      sick_leave,
      casual_leave
    )
    VALUES (?, 7, 7)

    ON DUPLICATE KEY UPDATE
    user_id = user_id
  `;

  await db.execute(insertQuery, [userId]);

  const query = `
    SELECT
      user_id,
      sick_leave,
      casual_leave
    FROM leave_balances
    WHERE user_id = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows[0];
};

// GET LEAVE SUMMARY
const getLeaveSummary = async (userId) => {
  const query = `
    SELECT
      leave_type,

      SUM(
        CASE
          WHEN status = 'Approved'
          THEN duration
          ELSE 0
        END
      ) AS approved_days,

      SUM(
        CASE
          WHEN status = 'Pending'
          THEN duration
          ELSE 0
        END
      ) AS pending_days

    FROM leave_requests

    WHERE user_id = ?

    GROUP BY leave_type
  `;

  const [rows] = await db.execute(query, [userId]);

  // Every employee gets 7 Sick + 7 Casual leaves

  const summary = {
    sick: {
      total: 7,
      used: 0,
      remaining: 7,
      pending: 0,
    },

    casual: {
      total: 7,
      used: 0,
      remaining: 7,
      pending: 0,
    },

    wfh: {
      total: 0,
      used: 0,
      remaining: null,
      pending: 0,
    },
  };

  rows.forEach((row) => {
    const approvedDays = Number(row.approved_days || 0);
    const pendingDays = Number(row.pending_days || 0);

    // SICK LEAVE

    if (row.leave_type === "Sick Leave") {
      summary.sick.used = approvedDays;

      summary.sick.remaining = Math.max(0, summary.sick.total - approvedDays);

      summary.sick.pending = pendingDays;
    }

    // CASUAL LEAVE

    if (row.leave_type === "Casual Leave") {
      summary.casual.used = approvedDays;

      summary.casual.remaining = Math.max(
        0,
        summary.casual.total - approvedDays,
      );

      summary.casual.pending = pendingDays;
    }

    // WFH

    if (row.leave_type === "WFH") {
      summary.wfh.used = approvedDays;
      summary.wfh.pending = pendingDays;
    }
  });

  return summary;
};

// GET MY LEAVE REQUESTS
const getMyLeaveRequests = async (userId) => {
  console.log("========== GET MY LEAVE REQUESTS ==========");

  console.log("Received userId:", userId);

  const query = `
    SELECT
      id,
      leave_type,
      start_date,
      end_date,
      duration,
      reason,
      status,
      created_at,
      updated_at
    FROM leave_requests
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  console.log("Executing leave history query...");

  const [rows] = await db.execute(query, [userId]);

  console.log("QUERY COMPLETED");

  console.log("ROWS:", rows);

  return rows;
};

const getAllLeaveRequests = async () => {
  const query = `
    SELECT
      lr.id,
      lr.user_id,
      lr.leave_type,
      lr.start_date,
      lr.end_date,
      lr.duration,
      lr.reason,
      lr.status,
      lr.created_at,
      lr.updated_at,

      u.employee_id,
      u.firstname,
      u.lastname,
      u.working_email,
      u.personal_email,
      u.profile_image

    FROM leave_requests lr

    INNER JOIN users u
      ON lr.user_id = u.id

    ORDER BY lr.created_at DESC
  `;

  const [rows] = await db.execute(query);

  return rows;
};

const approveLeaveRequest = async (leaveId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Get leave request
    const [leaveRows] = await connection.execute(
      `
        SELECT
          id,
          user_id,
          leave_type,
          duration,
          status
        FROM leave_requests
        WHERE id = ?
        FOR UPDATE
        `,
      [leaveId],
    );

    if (leaveRows.length === 0) {
      throw new Error("Leave request not found");
    }

    const employeeId = leaveRows[0].user_id;
    const leaveType = leaveRows[0].leave_type;
    const leave = leaveRows[0];

    console.log("Leave being approved:", leave);

    // await notificationService.createNotification({
    //   userId: employeeId,
    //   type: "LEAVE_APPROVED",
    //   title: "Leave Request Approved ✅",
    //   message: `Your ${leaveType} request has been approved by HR.`,
    // });

    // Only pending request can be approved
    if (leave.status !== "Pending") {
      throw new Error(`Leave request is already ${leave.status}`);
    }

    // WFH doesn't consume balance
    if (leave.leave_type === "WFH") {
      await connection.execute(
        `
        UPDATE leave_requests

        SET
          status = 'Approved',
          updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [leaveId],
      );

      await connection.commit();

      return {
        leaveId,
        status: "Approved",
        message: "WFH request approved",
      };
    }
    // Get balance
    const [balanceRows] = await connection.execute(
      `
        SELECT
          sick_leave,
          casual_leave

        FROM leave_balances

        WHERE user_id = ?

        FOR UPDATE
        `,
      [leave.user_id],
    );

    if (balanceRows.length === 0) {
      throw new Error("Leave balance not found for employee");
    }

    const balance = balanceRows[0];

    // Sick Leave
    if (leave.leave_type === "Sick Leave") {
      if (Number(balance.sick_leave) < Number(leave.duration)) {
        throw new Error(
          `Employee has only ${balance.sick_leave} sick leave day(s) remaining`,
        );
      }

      await connection.execute(
        `
        UPDATE leave_balances
        SET sick_leave =
          sick_leave - ?
        WHERE user_id = ?
        `,
        [leave.duration, leave.user_id],
      );
    }

    // Casual Leave
    if (leave.leave_type === "Casual Leave") {
      if (Number(balance.casual_leave) < Number(leave.duration)) {
        throw new Error(
          `Employee has only ${balance.casual_leave} casual leave day(s) remaining`,
        );
      }

      await connection.execute(
        `
        UPDATE leave_balances

        SET casual_leave =
          casual_leave - ?

        WHERE user_id = ?
        `,
        [leave.duration, leave.user_id],
      );
    }

    // Approve
    await connection.execute(
      `
      UPDATE leave_requests

      SET
        status = 'Approved',
        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [leaveId],
    );

    await connection.commit();

    return {
      leaveId,
      status: "Approved",
      message: "Leave approved successfully",
    };
  } catch (error) {
    await connection.rollback();

    console.error("Service approve error:", error);

    throw error;
  } finally {
    connection.release();
  }
};

const rejectLeaveRequest = async (leaveId) => {

  // =====================================================
  // GET LEAVE REQUEST
  // =====================================================

  const [leaveRows] = await db.execute(
    `
    SELECT
      user_id,
      leave_type,
      status
    FROM leave_requests
    WHERE id = ?
    `,
    [leaveId]
  );

  if (leaveRows.length === 0) {
    throw new Error("Leave request not found");
  }

  const leave = leaveRows[0];

  // =====================================================
  // CHECK STATUS
  // =====================================================

  if (leave.status !== "Pending") {
    throw new Error(
      `Leave request is already ${leave.status}`
    );
  }

  // =====================================================
  // REJECT LEAVE
  // =====================================================

  const [result] = await db.execute(
    `
    UPDATE leave_requests
    SET
      status = 'Rejected',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    AND status = 'Pending'
    `,
    [leaveId]
  );

  if (result.affectedRows === 0) {
    throw new Error(
      "Leave request not found or already processed"
    );
  }

  return {
    leaveId,
    userId: leave.user_id,
    leaveType: leave.leave_type,
    status: "Rejected",
    message: "Leave rejected successfully",
  };
};

// const rejectLeaveRequest = async (id) => {
//   const query = `
//     UPDATE leave_requests
//     SET
//       status = 'Rejected',
//       updated_at = CURRENT_TIMESTAMP
//     WHERE id = ?
//     AND status = 'Pending'
//   `;

//   const [leaveRows] = await db.execute(
//     `
//   SELECT user_id, leave_type
//   FROM leave_requests
//   WHERE id = ?
//   `,
//     [leaveId],
//   );

//   if (leaveRows.length === 0) {
//     throw new Error("Leave request not found");
//   }

//   const employeeId = leaveRows[0].user_id;
//   const leaveType = leaveRows[0].leave_type;

  

//   const [result] = await db.execute(query, [id]);

//   if (result.affectedRows === 0) {
//     throw new Error("Leave request not found or already processed");
//   }

//   return {
//     leaveId,
//     status: "Rejected",
//     message: "Leave rejected successfully",
//   };
// };

const getUserLeaveHistory = async (userId) => {
  const [rows] = await db.query(
    `SELECT
      l.id,
      l.leave_type,
      l.start_date,
      l.end_date,
      l.duration,
      l.reason,
      l.status,
      l.created_at
    FROM leave_requests l
    WHERE l.user_id = ?
    ORDER BY l.created_at DESC
    `,
    [userId],
  );

  return rows;
};
const getLeaveRequestById = async (id) => {
  const query = `
    SELECT *
    FROM leave_requests
    WHERE id = ?
  `;

  const [rows] = await db.execute(query, [id]);

  return rows[0];
};
module.exports = {
  createLeaveRequest,
  getEmployeeById,
  getLeaveBalance,
  getLeaveSummary,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getUserLeaveHistory,
  getLeaveRequestById,
};
