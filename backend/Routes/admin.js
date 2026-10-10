const express= require("express");
const router = express.Router();
const adminuser = process.env.ADMIN_USER;
const adminpass = process.env.ADMIN_PASS;

router.post("/adminlogin", (req, res) => {
    const { username, password } = req.body

    if (username === adminuser && password === adminpass) {
        res.send("admin is here")
    } else {
        res.status(401).send("unauthrized")
    }
});

 module.exports=router;