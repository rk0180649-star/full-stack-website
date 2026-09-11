const OTP = require("../Model/OTP"); // Apne OTP model ka sahi path check karein
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendLanguageOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // 6 digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Purana OTP delete karke naya save karta hai
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    // Resend email sending
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Ya apna verified domain wala email
      to: email,
      subject: "Security Verification: Language Switch to French",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 15px;">
          <h2>Security Verification Code</h2>
          <p>You requested to change your platform language to <strong>French</strong>.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
          <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyLanguageOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Verification successful, ab DB se OTP delete 
    await OTP.deleteMany({ email });

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};