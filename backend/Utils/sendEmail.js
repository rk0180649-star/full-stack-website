/*const nodemailer = require("nodemailer");
/*

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // aapka gmail
      pass: process.env.EMAIL_PASS, // gmail ka 16-digit App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification for Registration",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;*/

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "InternArea <onboarding@resend.dev>",
      to: [email],
      subject: "Your OTP Verification Code - InternArea",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>InternArea Verification</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="color: #2563eb; letter-spacing: 4px; font-size: 32px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully via Resend:", data.id);
    return data;
  } catch (err) {
    console.error("sendEmail utility error:", err);
    throw err;
  }
};

module.exports = sendEmail;