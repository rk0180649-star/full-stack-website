const crypto = require("crypto");
const Razorpay = require("razorpay");
const { Resend } = require("resend");
const User = require("../Model/User");
const PlanHistory = require("../Model/PlanHistory");

// Secret keys
const resend = new Resend(process.env.RESEND_API_KEY);
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Helper: 5:00 AM to 11:45 AM IST Validation
function isWithinAllowedTime() {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  const totalMinutes = istDate.getHours() * 60 + istDate.getMinutes();

  // 5:00 AM = 300 minutes, 11:45 AM = 705 minutes
  // Testing ke liye "return true;" kar sakte hain
  return totalMinutes >= 300 && totalMinutes <= 705;
}

// 1. Razorpay Order Create karna (Time Window Check ke sath)
exports.createOrder = async (req, res) => {
  try {
    // IST Time check
    if (!isWithinAllowedTime()) {
      return res.status(403).json({
        success: false,
        message: "Payments are only allowed between 5:00 AM and 11:45 AM IST.",
      });
    }

    const { amount, planId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const options = {
      amount: amount * 100, // paise me convert
      currency: "INR",
      receipt: `plan_rcpt_${Date.now()}`,
      notes: { planId },
    };

    const order = await razorpay.orders.create(options);
    return res.json(order);
  } catch (error) {
    console.error("Plan Order create error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Payment Verify karna aur User & History update karna
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      amount,
      userId,
      email,
    } = req.body;

    // Exact resumeController wala payload logic:
    const payload =razorpay_order_id + "|" + razorpay_payment_id;
    
    // Check karein process.env.RAZORPAY_KEY_SECRET theek se read ho raha hai ya nahi
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload.toString())
      .digest("hex");

    console.log("--> Expected:", expectedSignature);
    console.log("--> Received:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Quota allocation
    let quota = 1;
    if (planId === "BRONZE") quota = 3;
    if (planId === "SILVER") quota = 5;
    if (planId === "GOLD") quota = 999999;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Save to PlanHistory
    await PlanHistory.create({
      user: userId || null,
      email,
      planId,
      amount,
      quota,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      planStartDate: startDate,
      planEndDate: endDate,
    });

    const cleanEmail = email.toLowerCase().trim();
    const updatedUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          currentPlan: planId,
          planStatus: "ACTIVE",
          applicationQuota: quota,
          applicationsUsed: 0,
          planStartDate: startDate,
          planEndDate: endDate,
        },
        $setOnInsert: {
          name: req.body.name || "Candidate",
          createdAt: new Date(),
        }
      },
      { new: true, upsert: true } // 👉 upsert: true Google users ke liye critical hai
    );
        // Send confirmation email
    if (email) {
      await resend.emails.send({
        from: "InternArea <onboarding@resend.dev>",
        to: email,
        subject: `Subscription Invoice: ${planId} Plan Activated`,
        html: `
          <div>
            <h2>Payment Successful!</h2>
            <p>Aapka <b>${planId}</b> plan activate ho chuka hai.</p>
            <p><b>Amount:</b> ₹${amount}</p>
            <p><b>Payment ID:</b> ${razorpay_payment_id}</p>
          </div>
        `,
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// User subscription details fetch karna
exports.getUserSubscription = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Days remaining calculate karna
    let daysLeft = 0;
    if (user.planEndDate) {
      const now = new Date();
      const end = new Date(user.planEndDate);
      const diffTime = end.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return res.json({
      success: true,
      subscription: {
        currentPlan: user.currentPlan || "FREE",
        planStatus: user.planStatus || "ACTIVE",
        applicationQuota: user.applicationQuota ?? 1,
        applicationsUsed: user.applicationsUsed ?? 0,
        applicationsLeft:
          user.currentPlan === "GOLD"
            ? "Unlimited"
            : Math.max(0, (user.applicationQuota ?? 1) - (user.applicationsUsed ?? 0)),
        daysLeft,
        planEndDate: user.planEndDate,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};