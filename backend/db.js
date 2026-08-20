/*const mongoose = require("mongoose");
require("dotenv").config();

const database = process.env.DATABASE_URL;
const url = database;

module.exports.connect = () => {
    mongoose.connect(url);
    console.log("Database is connected");

        mongoose
    .connect(url, { family: 4 }) // <-- { family: 4 } add karein
    .then(() => console.log("Database is connected"))
    .catch((err) => console.log("DB Connection Error:", err.message)); 
};

const mongoose = require("mongoose");
require("dotenv").config();

const database = process.env.DATABASE_URL;
const url = database;

module.exports.connect = () => {
  mongoose
    .connect(url, { family: 4 })
    .then(() => console.log("Database is connected"))
    .catch((err) => console.log("DB Connection Error:", err.message));
};
*/
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // 👈 Yeh DNS resolve karne ke liye zaroori hai

const mongoose = require("mongoose");
require("dotenv").config();

const database = process.env.DATABASE_URL;
const url = database;

module.exports.connect = () => {
  mongoose
    .connect(url)
    .then(() => console.log("Database is connected"))
    .catch((err) => console.log("DB Connection Error:", err.message));
};