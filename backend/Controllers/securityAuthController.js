
// server/Controllers/securityAuthController.js
const LoginLog = require("../Model/LoginLog");
const Session = require("../Model/Session");
const User = require("../Model/User");

const sendEmail = require("../Utils/sendEmail"); 
const { getClientDetails } = require("../Utils/deviceDetector");
const crypto = require("crypto");

// In-memory OTP store
const otpStore = new Map();

// Helper: Indian Standard Time (IST) check (10:00 AM - 1:00 PM)
function isMobileAllowedTimeIST() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // UTC+5:30
  const istDate = new Date(now.getTime() + istOffset);

  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const totalMinutes = hours * 60 + minutes;

  const startMinutes = 10 * 60; // 10:00 AM
  const endMinutes = 13 * 60;   // 01:00 PM

  return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
}

// 1. LOGIN & SECURITY ATTEMPT HANDLER
exports.login = async (req, res) => {
  const { email } = req.body;

  try {
    const clientInfo = await getClientDetails(req);

    // --- RULE 1: Mobile Device Time Restriction ---
    if (clientInfo.deviceType === "mobile" || clientInfo.deviceType === "tablet") {
      if (!isMobileAllowedTimeIST()) {
        await LoginLog.create({
          email,
          ...clientInfo,
          status: "BLOCKED",
          failureReason: "Mobile logins only permitted between 10:00 AM and 1:00 PM IST",
        });

        return res.status(403).json({
          success: false,
          message: "Mobile device access is strictly restricted outside 10:00 AM - 1:00 PM IST.",
        });
      }
    }

    // --- RULE 2: Chrome Browser OTP Requirement ---
    const isChrome = clientInfo.browserName.toLowerCase().includes("chrome");

    if (isChrome) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        clientInfo,
      });

      console.log(`[SECURITY] OTP for ${email} (Chrome Login): ${otp}`);

      await LoginLog.create({
        email,
        ...clientInfo,
        status: "OTP_PENDING",
        failureReason: "Pending Chrome OTP Verification",
      });

      try {
        await sendEmail(email, otp);
      } catch (mailError) {
        console.error("Resend Email Send Error:", mailError.message);
      }

      return res.status(200).json({
        success: true,
        requireOtp: true,
        message: "OTP sent to registered email for Chrome security verification.",
      });
    }

    // Non-Chrome (Edge, Firefox etc.): Session yahan nahi banega, seedhe green signal dein
    return res.status(200).json({
      success: true,
      requireOtp: false,
      message: "Device allowed, proceed to login",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 2. CHROME OTP VERIFICATION HANDLER
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: "OTP is expire " });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Galat OTP is wrong" });
    }

    const user = await User.findOne({ email });
    const clientInfo = record.clientInfo || await getClientDetails(req);
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Single Session per device/browser update
    await Session.findOneAndUpdate(
      { 
        email: email, 
        browser: clientInfo.browserName, 
        os: clientInfo.os 
      },
      {
        userId: user ? user._id : undefined,
        email: email,
        token: sessionToken,
        browser: clientInfo.browserName,
        browserName: clientInfo.browserName,
        os: clientInfo.os,
        deviceType: clientInfo.deviceType,
        ipAddress: clientInfo.ipAddress,
        location: `${clientInfo.city || ""}, ${clientInfo.country || ""}`,
        lastActiveAt: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );
    
    // Chrome Success Log
    await LoginLog.create({
      userId: user ? user._id : undefined,
      email: email,
      ipAddress: clientInfo.ipAddress,
      browserName: clientInfo.browserName,
      browserVersion: clientInfo.browserVersion,
      os: clientInfo.os,
      deviceType: clientInfo.deviceType,
      city: clientInfo.city,
      country: clientInfo.country,
      status: "SUCCESS",
    });

    otpStore.delete(email);

    return res.status(200).json({
      success: true,
      message: "Security verification successful",
      token: sessionToken,
      user: user || { email },
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};