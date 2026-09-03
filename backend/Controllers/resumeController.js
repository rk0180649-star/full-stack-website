const crypto = require("crypto");
const Razorpay = require("razorpay");
const puppeteer = require("puppeteer");
const { Resend } = require("resend"); // Nodemailer ki jagah Resend
const OTP = require("../Model/OTP");
const ResumeHistory = require("../Model/ResumeHistory");
const User = require("../Model/User");

// Resend instance initialize karein
const resend = new Resend(process.env.RESEND_API_KEY);
const RAZORPAY_KEY_ID = "rzp_test_TXTSZuElZoackt";
const RAZORPAY_KEY_SECRET = "ncBgAb3FWpDtQzDV6uxL4O52";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});




// 1. Email par OTP bhejna
// Function ke upar User model hona chahiye:
exports.sendResumeOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required hai" });
    }
    // 1. Check user registered hai ya nahi
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Aapka account register nahi hai. Kripya pehle register karein.",
      });
    }
    // 2. 6-Digit OTP generate aur DB me update
    const otp = crypto.randomInt(100000, 999999).toString();

    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );
    // 3. Resend API se mail bhejein
    const { data, error } = await resend.emails.send({
      from: "InternArea <onboarding@resend.dev>", // Agar custom domain verified hai to apna domain daalein (e.g., support@yourdomain.com)
      to: email,
      subject: "Resume Builder Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Resume Download Verification</h2>
          <p>Aapka ₹50 resume purchase verification OTP hai:</p>
          <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
          <p>Yeh OTP agle 5 minute ke liye valid hai.</p>
        </div>
        `,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({ success: true, message: "OTP sent" });
    } catch (error) {
      console.error("Server Error:", error);
      return res.status(500).json({ success: false, error: error.message });
      }
    };

  // 2. OTP Verify karna
  exports.verifyResumeOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const record = await OTP.findOne({ email, otp });

      if (!record) {
        return res.status(400).json({ success: false, message: "Invalid ya expired OTP" });
      }

      // Ek baar use hone ke baad OTP delete
      await OTP.deleteOne({ _id: record._id });
      return res.json({ success: true, message: "OTP verified" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  // 3. Razorpay Order Create karna (₹50)
  exports.createOrder = async (req, res) => {
    try {
      const options = {
        amount: 50 * 100, // 5000 paise = ₹50
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      return res.json(order);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  // 4. Payment Signature Verify karna + PDF Generate karna
  exports.verifyPaymentAndGenerate = async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        resumeData,
        userId,
      } = req.body;

    // Razorpay Signature match karein
    const expectedSignature = crypto
      .createHmac("sha256", "ncBgAb3FWpDtQzDV6uxL4O52")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

  // Database me default update karein
    if (userId) {
      await ResumeHistory.updateMany({ user: userId }, { isDefault: false });
    
      const savedResume = await ResumeHistory.create({
        user: userId,
        email: resumeData.email,
        resumeData,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        isDefault: true,
      });
      // User document me purchase update karein
      await User.findByIdAndUpdate(userId, {
        hasPurchasedResume: true,
        purchasedResumeId: savedResume._id,
      });
    }


    // Puppeteer se PDF HTML render karna
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"] 
    });
    const page = await browser.newPage();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #0284c7; margin-bottom: 4px; text-transform: uppercase; font-size: 24px; }
            p { font-size: 13px; line-height: 1.5; color: #475569; margin: 4px 0; }
            hr { border: 0; border-top: 1.5px solid #0284c7; margin: 15px 0; }
            .section { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #0f172a; margin-top: 18px; letter-spacing: 0.5px; }
            .content { white-space: pre-line; margin-top: 5px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>${resumeData.fullName || "Your Name"}</h1>
          <p>${resumeData.email || ""} | ${resumeData.phone || ""}</p>
          <hr />
          <div class="section">Objective</div>
          <div class="content">${resumeData.objective || ""}</div>
          <div class="section">Skills</div>
          <div class="content">${resumeData.skills || ""}</div>
          <div class="section">Education</div>
          <div class="content">${resumeData.education || ""}</div>
          <div class="section">Work Experience</div>
          <div class="content">${resumeData.experience || ""}</div>
          <div class="section">Projects</div>
          <div class="content">${resumeData.projects || ""}</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    const base64Pdf = Buffer.from(pdfBuffer).toString("base64");
    return res.json({
      success: true,
      downloadUrl: `data:application/pdf;base64,${base64Pdf}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};