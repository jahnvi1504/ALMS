# 🗓️ Online Leave Management System (MERN Stack)

A professional web-based **Leave Application and Approval System** designed for modern organizations. This MERN stack application streamlines the process for employees to apply for leave and for managers to efficiently review and manage requests. It is built with **Role-Based Access Control (RBAC)** and features like automatic holiday blocking and real-time status updates.

---

## ✨ Key Features & Functionality

### 👨‍💼 Employee Portal
* **Secure Authentication:** Register and log in using **JWT-based authentication**.
* **Leave Application:** Apply for leave by specifying dates and providing a reason.
* **History & Status:** View personal leave application history and track the current status (pending, approved, rejected).
* **Holiday View:** Access a list of upcoming company holidays.
* **Notifications:** Receive real-time alerts upon manager approval or rejection of a request.

### 👩‍💼 Manager Portal
* **Privileged Access:** Login with exclusive manager privileges.
* **Request Management:** View a comprehensive list of all pending employee leave requests.
* **Decision Making:** Easily **approve or reject** requests.
* **Team Calendar:** View a calendar showing team availability to prevent overlapping leaves.

### 🔒 System Architecture
* **Role-Based Access Control (RBAC):** Ensures users only access features relevant to their role (`employee` or `manager`).
* **Data Security:** Passwords are **hashed** and communication is secured via **JWT**.
* **Auto-Blocking:** Employees are prevented from applying for leave on pre-defined public holidays.

---

## 🛠️ Tech Stack

This project is powered by the **MERN** (MongoDB, Express, React, Node) stack.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js, Axios, React Router** | Building dynamic UIs and handling API requests. |
| **Backend** | **Node.js, Express.js** | High-performance server-side logic and API routing. |
| **Database** | **MongoDB, Mongoose** | NoSQL data storage and object data modeling. |
| **Authentication** | **JSON Web Tokens (JWT)** | Secure, state-less user session management. |
| **Styling** | **Tailwind CSS / Bootstrap** | Rapid, responsive, and utility-first styling. |
| **Real-time** | **Socket.io** (Optional) | Enabling instant notifications. |

---

## 📂 Database Schema Overview (Mongoose Models)

The data models define the structure of the information stored in the MongoDB database:

### **User Model Fields**
The user model includes fields for: `name`, `email`, `password` (which is stored Hashed), `role` (either 'employee' or 'manager'), and `leaveBalance` (a Number).

### **LeaveRequest Model Fields**
This model tracks applications with: `employeeId` (ObjectId), `fromDate` (Date), `toDate` (Date), `reason` (String), `status` (which can be 'pending', 'approved', or 'rejected'), `managerId` (ObjectId), `createdAt` (Date), and `updatedAt` (Date).

### **Holiday Model Fields**
This simple model contains: `date` (Date) and `title` (String).

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

To get the project files, you need to use the Git clone command and then change into the project directory:

`git clone https://github.com/Mantu008/leave-management.git`
`cd leave-management`

### 2. Install Dependencies

You must install dependencies separately for both the backend (`server`) and the frontend (`client`).

**Backend setup**
`cd server`
`npm install`

**Frontend setup**
`cd ../client`
`npm install`

### 3. Configure Environment Variables

Create a file named `.env` inside the `/server` directory and populate it with your specific connection details:

**The .env file should contain:**
`PORT=5000`
`MONGO_URI=your_mongodb_connection_string`
`JWT_SECRET=a_strong_secret_key_for_jwt`

### 4. Run the Application

Start the server and client separately to run the full application.

**Start backend (API server)**
`cd server`
`npm run dev`
*(The server runs on http://localhost:5000)*

**Start frontend (React app)**
`cd ../client`
`npm start`
*(The client typically runs on http://localhost:3000)*

---

## ⚡ Future Enhancements

The following features are planned for future development:

* **Admin Role:** Dedicated admin role to manage users, roles, and system-wide settings/holidays.
* **Email Service:** Integration of **Nodemailer** for email notifications on status changes.
* **Reporting:** Functionality to download leave history as **PDF** or export reports to **Excel**.
* **Localization:** Multi-language (i18n) support.
* **Attendance Integration:** Linking leave with daily attendance records.

---

## 🤝 Contribution Guidelines

Contributions are welcome! If you have a suggestion or a fix, please follow these steps:

1.  **Fork** the repository.
2.  Create your feature branch using a command like: `git checkout -b feature-name`.
3.  Commit your changes using a clear message, for example: `git commit -am 'Add new feature'`.
4.  Push your changes to your feature branch: `git push origin feature-name`.
5.  Open a **Pull Request** to the main repository.

---
