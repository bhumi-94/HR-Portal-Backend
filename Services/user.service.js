const db = require("../Configurations/db.config");

const getAllUsers = async () => {
  const [rows] = await db.query(`
    SELECT
      id,
      employee_id,
      CONCAT(firstname, ' ', lastname) AS fullname,
      username,
      personal_email,
      working_email,
      phone,
      address,
      gender,
      department,
      job_title,
      role,
      isActive,
      profile_image
    FROM users
    WHERE role = 0
    ORDER BY id ASC
  `);

  return rows;
};


// ===============================
// UPDATE USER STATUS
// ===============================

const updateUserStatus = async (id, isActive) => {
  const [result] = await db.query(
    `
    UPDATE users
    SET isActive = ?
    WHERE id = ? AND role = 0
    `,
    [isActive, id]
  );

  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }

  const [rows] = await db.query(
    `
    SELECT
      id,
      employee_id,
      CONCAT(firstname, ' ', lastname) AS fullname,
      username,
      personal_email,
      working_email,
      phone,
      address,
      gender,
      department,
      job_title,
      profile_image,
      role,
      isActive
    FROM users
    WHERE id = ?
    `,
    [id]
  );

  return rows[0];
};
module.exports = {
  getAllUsers,
  updateUserStatus,
};