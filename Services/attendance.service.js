const db = require("../Configurations/db.config");

// ================= TAP IN =================

const tapInService = async (userId) => {
  const [existing] = await db.query(
    `SELECT *
     FROM attendance
     WHERE user_id = ?
       AND tap_in_date = CURDATE()`,
    [userId],
  );

  if (existing.length > 0) {
    throw new Error("You have already Tapped-In");
  }

  const [result] = await db.query(
    `INSERT INTO attendance
      (user_id, tap_in_date, tap_in_time)
     VALUES (?, CURDATE(), CURTIME())`,
    [userId],
  );

  return result.insertId;
};

// ================= TAP OUT =================

const tapOutService = async (userId) => {
  const [attendance] = await db.query(
    `SELECT *
     FROM attendance
     WHERE user_id = ?
       AND tap_in_date = CURDATE()
       AND tap_out_time IS NULL
     ORDER BY id DESC
     LIMIT 1`,
    [userId],
  );

  if (attendance.length === 0) {
    throw new Error("You have not tapped in today");
  }

  await db.query(
    `UPDATE attendance
     SET
       tap_out_date = CURDATE(),
       tap_out_time = CURTIME()
     WHERE id = ?`,
    [attendance[0].id],
  );

  return attendance[0].id;
};

// ================= GET MY ATTENDANCE =================

const getMyAttendanceService = async (userId) => {
  const [rows] = await db.query(
    `SELECT
       id,
       user_id,
       tap_in_date,
       tap_in_time,
       tap_out_date,
       tap_out_time
     FROM attendance
     WHERE user_id = ?
       AND tap_in_date >= CURDATE() - INTERVAL 6 DAY
     ORDER BY tap_in_date DESC`,
    [userId],
  );

  // Return rows directly
  return rows;
};

const getEmployeeHistory = async () => {
  const [rows] = await db.query(`
    SELECT
      u.id AS user_id,
      u.employee_id,
      u.fullname,
      u.profile_image,

      a.id AS attendance_id,

      DATE_FORMAT(a.tap_in_date, '%Y-%m-%d') AS tap_in_date,

      TIME_FORMAT(a.tap_in_time, '%H:%i:%s') AS tap_in_time,

      DATE_FORMAT(a.tap_out_date, '%Y-%m-%d') AS tap_out_date,

      TIME_FORMAT(a.tap_out_time, '%H:%i:%s') AS tap_out_time

    FROM users u

    LEFT JOIN attendance a
      ON u.id = a.user_id
      AND a.tap_in_date >= CURDATE() - INTERVAL 6 DAY
      AND a.tap_in_date <= CURDATE()

    WHERE u.role = 0

    ORDER BY
      u.id ASC,
      a.tap_in_date DESC
  `);

  return rows;
};

module.exports = {
  tapInService,
  tapOutService,
  getMyAttendanceService,
  getEmployeeHistory,
};
