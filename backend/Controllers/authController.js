
const User = require("../Model/User");
const OTP = require("../Model/OTP");
const sendEmail = require("../Utils/sendEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. Send OTP Function
exports.sendOtp = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // 1. Mandatory fields check
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields (Name, Email, Mobile, Password) before requesting OTP.",
      });
    }

    // 2. Check if Email or Mobile already registered
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? "Email" : "Mobile number";
      return res.status(400).json({
        success: false,
        message: `${conflictField} is already registered! Please login.`,
      });
    }

    // 3. Generate & Save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    await sendEmail(email, otp);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 2. Register Function (With Mobile Support)
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, otp } = req.body;

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Check if Email or Mobile is already registered
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile: mobile || "N/A" }],
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email or Mobile already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      mobile: mobile || null,
      password: hashedPassword,
    });

    await OTP.deleteMany({ email });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, email: newUser.email, name: newUser.name, mobile: newUser.mobile },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Login Function (Email OR Mobile Login)
exports.login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;

    // Login identifier chahe 'identifier' key me aaye ya purane 'email' key me
    const loginInput = identifier || email;

    if (!loginInput || !password) {
      return res.status(400).json({ success: false, message: "Please enter Email/Mobile and Password" });
    }

    // Check if input is Email or Mobile Number
    const isEmail = loginInput.includes("@");
    const user = await User.findOne(
      isEmail ? { email: loginInput.toLowerCase() } : { mobile: loginInput }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this Email/Mobile" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Step 4: Forgot Password OTP (With 24 Hours Check)
exports.forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    // 24 Hours Check
    if (user.lastPasswordReset) {
      const now = new Date();
      const lastResetTime = new Date(user.lastPasswordReset).getTime();
      const currentTime = now.getTime();

      const diffInHours = (currentTime - lastResetTime) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        const remainingHours = Math.ceil(24 - diffInHours);
        return res.status(429).json({
          success: false,
          message: `Password can only be reset once every 24 hours. Please wait ${remainingHours} hour(s) before trying again.`,
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    await sendEmail(email, otp);

    res.status(200).json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Step 5: Reset Password with OTP Verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Password change aur lastPasswordReset ko update karein
    await User.findOneAndUpdate(
      { email },
      { 
        $set: {
          password: hashedPassword,
          lastPasswordReset: new Date()
        }
      }
    );

    await OTP.deleteMany({ email });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};