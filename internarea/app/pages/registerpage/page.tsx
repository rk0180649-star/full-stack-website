"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // UI States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

 const BACKEND_URL = "https://full-stack-website-h8ju.onrender.com/api/auth";

  // Step 1: Send OTP Call (Sirf send-otp route par call jayega)
  /*const handleSendOtp = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email first!", type: "error" });
      return;
    }

    setLoadingOtp(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${BACKEND_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
      setMessage({ text: "OTP sent successfully to your email!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoadingOtp(false);
    }
  };
*/
// Step 1: Send OTP Call (All fields validated)
  const handleSendOtp = async () => {
    // 1. Check all required fields
    if (!name.trim()) {
      setMessage({ text: "Please enter your Full Name!", type: "error" });
      return;
    }

    if (!email.trim()) {
      setMessage({ text: "Please enter your Email Address!", type: "error" });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: "Please enter a valid Email Address!", type: "error" });
      return;
    }

    if (!mobile.trim() || mobile.length !== 10) {
      setMessage({ text: "Please enter a valid 10-digit Mobile Number!", type: "error" });
      return;
    }

    if (!password.trim() || password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long!", type: "error" });
      return;
    }

    setLoadingOtp(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${BACKEND_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
      setMessage({ text: "OTP sent successfully to your email!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoadingOtp(false);
    }
  }; 

// Step 2: Verify OTP & Register (Mobile bhi sath jayega)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setMessage({ text: "Please enter the OTP!", type: "error" });
      return;
    }

    setLoadingRegister(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage({ text: "Account created! Redirecting to login...", type: "success" });
      setTimeout(() => {
        router.push("/pages/gmailloginpage");
      }, 1500);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Register with Email & Mobile
        </p>

        {/* Alert / Notification */}
        {message.text && (
          <div
            className={`p-3 rounded-lg mb-4 text-sm text-center ${
              message.type === "error"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="tel"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile Number (Optional/10 digits)"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loadingOtp}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {loadingOtp ? "Sending OTP..." : isOtpSent ? "Resend OTP" : "Send OTP"}
          </button>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loadingRegister}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loadingRegister ? "Registering..." : "Verify OTP & Register"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/pages/gmailloginpage"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}