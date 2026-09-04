# HR Portal Backend 🚀

This repository contains the backend REST API for the **HR Portal**, a full-stack Human Resource Management application.

The backend is built using **Node.js, Express.js, and MySQL** and provides secure APIs for authentication, employee management, attendance, leave management, holidays, notifications, feedback, profile management, and email notifications.

---

## 🌐 Frontend

The frontend of the HR Portal is built with React and deployed on Vercel.

👉 **Live Frontend:**  
https://your-frontend-url.vercel.app

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt
- Axios
- Nodemailer
- Multer
- CORS
- dotenv
- REST API

---

## ✨ Features

### 🔐 Authentication
- User registration
- User login
- JWT-based authentication
- Forgot password
- Reset password
- Protected routes
- Role-based authorization

### 👥 Employee Management
- Get employee details
- Update employee status
- Delete employee
- Profile management
- Profile image upload

### 🕐 Attendance Management
- Employee Tap In
- Employee Tap Out
- Attendance history
- Employee attendance history

### 📝 Leave Management
- Submit leave requests
- Leave balance management
- Leave summary
- Employee leave history
- HR leave request management
- Approve leave requests
- Reject leave requests

### 📅 Holiday Management
- Add holidays
- View holidays
- Holiday calendar
- Holiday notifications

### 🔔 Notifications
- Employee notifications
- HR notifications
- Leave approval notifications
- Leave rejection notifications
- Holiday notifications
- Mark notifications as read

### 💬 Feedback
- Submit employee feedback
- View employee feedback
- Send feedback notifications through email

### 📧 Email Notifications
The backend uses **Nodemailer** to send emails for important HR activities such as leave requests and feedback.

---

## 📁 Project Structure

```text
HR-Portal-Backend/
│
├── Configurations/
│   └── db.config.js
│
├── Controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── attendance.controller.js
│   ├── leave.controller.js
│   ├── holiday.controller.js
│   ├── notification.controller.js
│   └── feedback.controller.js
│
├── Services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── attendance.service.js
│   ├── leave.service.js
│   ├── holiday.service.js
│   ├── notification.service.js
│   └── feedback.service.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── attendance.routes.js
│   ├── leave.routes.js
│   ├── holiday.routes.js
│   ├── notification.routes.js
│   └── feedback.routes.js
│
├── middleware/
│   ├── auth.middleware.js
│   └── role.middleware.js
│
├── Validation/
│
├── Jobs/
│   └── holidayNotification.job.js
│
├── utils/
│   ├── email.js
│   └── errorLogger.js
│
├── uploads/
│
├── src/
│   └── app.js
│
├── server.js
├── package.json
└── .gitignore
