const db = require("../Configurations/db.config");

const createFeedback = async ({
  userId,
  username,
  jobTitle,
  problem,
  against,
}) => {
  const query = `
    INSERT INTO feedbacks
    (
      user_id,
      username,
      job_title,
      problem,
      against
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    userId,
    username,
    jobTitle,
    problem,
    against ?? null,
  ]);

  return {
    id: result.insertId,
    userId,
    username,
    jobTitle,
    problem,
    against: against ?? null,
  };
};


const getUserFeedback = async (userId) => {
  const query = `
    SELECT
      id,
      user_id,
      username,
      job_title,
      problem,
      against,
      status,
      created_at
    FROM feedbacks
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows;
};


const getHRUsers = async () => {
  const query = `
    SELECT
      id,
      firstname,
      lastname,
      working_email,
      personal_email
    FROM users
    WHERE role = 1
    AND isActive = 1
  `;

  const [rows] = await db.execute(query);

  return rows;
};


const getEmployeeById = async (userId) => {
  const query = `
    SELECT
      id,
      employee_id,
      firstname,
      lastname,
      fullname,
      job_title,
      working_email,
      personal_email
    FROM users
    WHERE id = ?
  `;

  const [rows] = await db.execute(query, [userId]);

  if (rows.length === 0) {
    throw new Error("Employee not found");
  }

  return rows[0];
};


module.exports = {
  createFeedback,
  getUserFeedback,
  getHRUsers,
  getEmployeeById,
};