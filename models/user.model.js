const connection = require("../Configurations/db.config");

// FIND USER BY EMAIL

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM users
      WHERE email = ?
    `;

    connection.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results[0]);
    });
  });
};

// CREATE USER

const createUser = (fullname, email, password) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO users
      (fullname, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [fullname, email, password , "user"], (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
};

// SAVE RESET TOKEN

const saveResetToken = (userId, resetToken, resetTokenExpiry) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users
      SET reset_token = ?,
          reset_token_expiry = ?
      WHERE id = ?
    `;

    connection.query(
      sql,
      [resetToken, resetTokenExpiry, userId],
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );
  });
};

// FIND USER BY RESET TOKEN

const findUserByResetToken = (resetToken) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM users
      WHERE reset_token = ?
    `;

    connection.query(sql, [resetToken], (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(results[0]);
    });
  });
};

// UPDATE PASSWORD

const updatePassword = (userId, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE users
      SET password = ?,
          reset_token = NULL,
          reset_token_expiry = NULL
      WHERE id = ?
    `;

    connection.query(query, [hashedPassword, userId], (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  saveResetToken,
  findUserByResetToken,
  updatePassword,
};
