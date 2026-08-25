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

// GET LEAVE SUMMARY

const getLeaveSummary = async (userId) => {
  const query = `
    SELECT
      leave_type,

      SUM(duration) AS total_days,

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

  const summary = {
    casual: {
      total: 0,
      pending: 0,
    },

    sick: {
      total: 0,
      pending: 0,
    },

    wfh: {
      total: 0,
      pending: 0,
    },
  };


  rows.forEach((row) => {

    if (row.leave_type === "Casual Leave") {
      summary.casual.total =
        Number(row.total_days || 0);

      summary.casual.pending =
        Number(row.pending_days || 0);
    }


    if (row.leave_type === "Sick Leave") {
      summary.sick.total =
        Number(row.total_days || 0);

      summary.sick.pending =
        Number(row.pending_days || 0);
    }


    if (row.leave_type === "WFH") {
      summary.wfh.total =
        Number(row.total_days || 0);

      summary.wfh.pending =
        Number(row.pending_days || 0);
    }

  });


  return summary;
};

// GET MY LEAVE REQUESTS

const getMyLeaveRequests = async (userId) => {

  const query = `
    SELECT
      id,
      leave_type,
      start_date,
      end_date,
      duration,
      reason,
      status,
      created_at

    FROM leave_requests

    WHERE user_id = ?

    ORDER BY created_at DESC
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows;
};


module.exports = {
  createLeaveRequest,
  getEmployeeById,
  getLeaveSummary,
  getMyLeaveRequests,
};

