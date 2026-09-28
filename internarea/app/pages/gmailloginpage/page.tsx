"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/app/firebase/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { login } from "@/app/Feature/Userslice";
import OtpModal from "@/app/components/OtpModal";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://full-stack-website-h8ju.onrender.com/api/auth";
 
  // Security & OTP States
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [securityEmail, setSecurityEmail] = useState<string>("");

// 1. Backend Security Check (Mobile Time & Chrome Check)
const checkSecurityRules = async (userEmail: string) => {
  try {
    const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/security/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
    const data = await res.json();
    // Mobile Time Restriction Block (403)
    if (res.status === 403) {
      setError(data.message || "Mobile access restricted outside 10:00 AM - 1:00 PM IST");
      return false;
    }
    // Chrome OTP Required
    if (data.requireOtp) {
      setSecurityEmail(userEmail);
      setShowOtpModal(true);
      return false;
    }
    return true; 
  } catch (err: any) {
    setError("Security check failed: " + err.message);
    return false;
  }
};

// 2. OTP Verify Handler (Modal ke liye)
const handleVerifyOtp = async (enteredOtp: string) => {
  setOtpLoading(true);
  try {
    const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/security/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: securityEmail, otp: enteredOtp }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Invalid OTP");
      return;
    }
    // Success - modal band 
    setShowOtpModal(false);
    // 1. Token save 
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    // 2. User info localStorage aur Redux me save
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(
        login({
          name: data.user.name || "User",
          email: data.user.email,
          photo: data.user.photo || "",
          uid: data.user._id || data.user.id,
        })
      );
    }
    // 3. Profile page par redirect 
    router.push("/pages/profile");
  } catch (err: any) {
    alert("OTP verification error: " + err.message);
  } finally {
    setOtpLoading(false);
  }
};

// 3. Resend OTP Handler
const handleResendOtp = async () => {
  await fetch("https://full-stack-website-h8ju.onrender.com/api/security/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: securityEmail }),
  });
};

  // 1. Manual Login (Email / Mobile)
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    // 1. Pehle Credentials verify karein aur local session 
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Invalid credentials");
    }
    // 2. Token aur User local storage me save
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    // 3. Security rules check karein (Chrome OTP check)
    const passed = await checkSecurityRules(data.user.email || identifier);
    if (!passed) {
      return; // Chrome me OTP dialog open hoga
    }
    // 4. Redux state update karein
    dispatch(
      login({
        name: data.user.name,
        email: data.user.email,
        photo: data.user.photo || "",
        uid: data.user._id || data.user.id,
      })
    );
 // 3. Profile page par redirect
    router.push("/pages/profile");
  } catch (err: any) {
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  // 2. Google Login
    const handleGoogleLogin = async () => {
      try {
        setError(""); // Purana error clear 
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
  
        // 1. Pehle Security check karein (Storage update karne se pehle)
        const passed = await checkSecurityRules(user.email || "");
        
        // Agar mobile block hai ya rule fail hua toh yahi cancel karein
        if (!passed) {
          await signOut(auth); // Firebase session turant khatam
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          return; 
        }
        // 2. Security pass hone par hi LocalStorage save 
        const token = await user.getIdToken();
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
          })
        );
        localStorage.setItem("token", token);
  
        // 3. Database mein login session record 
        await fetch("https://full-stack-website-h8ju.onrender.com/api/auth/record-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName,
          }),
        });
        // 4. Sab complete hone ke baad profile page par send karega
        router.push("/pages/profile");
      } catch (err: any) {
        console.error("Google Sign-In Error:", err);
        setError("Google Sign-In failed. Please try again.");
      }
    };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Login to your account
        </p>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg mb-4 text-sm text-center bg-red-100 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Email or Mobile
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter Email or 10-digit Mobile"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-right">
            <Link
              href="/pages/forgotpasswordpage"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition font-medium text-gray-700"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/pages/registerpage"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
            {/* Chrome Login Security OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        userEmail={securityEmail}
        loading={otpLoading}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}