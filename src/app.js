const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
require("../Configurations/db.config");
const authRoutes = require("../routes/auth.routes");
const userRoutes = require("../routes/user.routes");
const attendanceRoutes = require("../routes/attendance.routes");
const leaveRoutes = require("../routes/leave.routes")


app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance" , attendanceRoutes )
app.use("/api/leave", leaveRoutes);
// app.use("/api/leave", );

module.exports = app;



