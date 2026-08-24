/*const bodyparser = require("body-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const { connect } = require("./db");
const router = require("./Routes/index");
const port = 5000;

app.use(cors());
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello this is internshala backend by rupesh");
});

app.use("/api", router);
connect();
app.use((req,res,next)=> {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Origin", "*")
    next()

})

app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});*/

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

// Routes Setup
app.use("/api/auth", authRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/job", jobRoutes);

app.get("/", (req, res) => {
  res.send("Backend API running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});