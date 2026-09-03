const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db"); // db.js import

dotenv.config();

// Aapke db.js ke export function ko call karein
db.connect();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Import
const authRoutes = require("./Routes/authRoutes");
const internshipRoutes = require("./Routes/internship");
const applicationRoutes = require("./Routes/application");
const adminRoutes = require("./Routes/admin");
const jobRoutes = require("./Routes/job");
const resumeRoutes = require("./Routes/resume");

// Routes Setup
app.use("/api/auth", authRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
  res.send("Backend API running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});