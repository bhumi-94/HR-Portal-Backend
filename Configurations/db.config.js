const mysql = require("mysql2/promise");
const fs = require("fs");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA_PATH),
    rejectUnauthorized: true,
  },
});


db.getConnection()
  .then((connection) => {
    console.log("✅ Aiven MySQL connected successfully!");
    connection.release();
  })
  .catch((error) => {
    console.error("❌ Aiven MySQL connection failed:");
    console.error(error.message);
  });
module.exports = db;
