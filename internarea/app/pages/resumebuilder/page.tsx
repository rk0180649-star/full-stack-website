"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useSelector } from "react-redux";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ResumeBuilder() {
  // Live deployment ke liye live URL rakhein, local test ke liye localhost:5000
   const BACKEND_URL = "https://full-stack-website-h8ju.onrender.com";

  const user = useSelector((state: any) => state.user?.user);

  const [formData, setFormData] = useState({
    fullName: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91 9876543210",
    objective: "Motivated Computer Science graduate seeking software internship.",
    skills: "React, Next.js, Node.js, Tailwind CSS",
    education: "B.Tech in CSE - XYZ University (2022 - 2026)",
    experience: "Web Developer Intern - TechCorp (Summer 2025)",
    projects: "E-Commerce App using MERN stack",
    linkedin: "",
    github: "",
  });

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email,
      }));
    }
  }, [user]);

  const [themeColor, setThemeColor] = useState("#2563eb");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [step, setStep] = useState<"idle" | "otp" | "ready_to_pay" | "download_ready">("idle");
  const [otp, setOtp] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitiateDownload = async () => {
    setIsModalOpen(true);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("otp");
      } else {
        alert(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      alert("Backend server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/resume/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("ready_to_pay");
        initiateRazorpayPayment();
      } else {
        alert(data.message || "Invalid or expired OTP");
      }
    } catch (err) {
      alert("OTP verification fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  const initiateRazorpayPayment = async () => {
    setLoading(true);
    try {
      const orderRes = await fetch(`${BACKEND_URL}/api/resume/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const orderData = await orderRes.json();
 console.log(orderData)
      const options = {
        key: "rzp_test_TXYXVNehnLBLcI", // Exact matching key (small 'k')
        amount: orderData.amount,
        currency: "INR",
        name: "Resume Builder Premium",
        description: "ATS Resume PDF Download",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${BACKEND_URL}/api/resume/verify-and-generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                resumeData: formData,
                userId: user?._id || null,
              }),
            });
            const result = await verifyRes.json();
            if (result.success) {
              setDownloadLink(result.downloadUrl);
              setStep("download_ready");
            } else {
              alert(result.message || "Payment verification fail ho gaya.");
            }
          } catch (err) {
            alert("PDF generation me error aaya.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: themeColor },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert("Payment window open nahi ho saki.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Premium ATS Resume Builder</h1>
          <button
            onClick={handleInitiateDownload}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition shadow"
          >
            Download PDF (₹50)
          </button>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto w-full">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Customization & Details</h2>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Theme Color:</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border"
              />
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="border p-2 rounded-md text-sm"
              >
                <option value="modern">Modern ATS</option>
                <option value="minimal">Minimal Classic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Career Objective</label>
              <textarea
                name="objective"
                rows={2}
                value={formData.objective}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Education</label>
              <textarea
                name="education"
                rows={2}
                value={formData.education}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Experience</label>
              <textarea
                name="experience"
                rows={2}
                value={formData.experience}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Projects</label>
              <textarea
                name="projects"
                rows={2}
                value={formData.projects}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub / Portfolio</label>
                <input
                  type="url"
                  name="github"
                  placeholder="https://github.com/..."
                  value={formData.github || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 overflow-y-auto max-h-[85vh]">
            <div className="border-b-2 pb-4" style={{ borderColor: themeColor }}>
              <h1 className="text-2xl font-bold uppercase tracking-wide" style={{ color: themeColor }}>
                {formData.fullName}
              </h1>
              <p className="text-xs text-slate-600 mt-1 flex flex-wrap gap-1 items-center">
                <span>{formData.email}</span>
                {formData.phone && <span>| {formData.phone}</span>}
                {formData.linkedin && (
                  <>
                    <span>|</span>
                    <a href={formData.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      LinkedIn
                    </a>
                  </>
                )}
                {formData.github && (
                  <>
                    <span>|</span>
                    <a href={formData.github} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      GitHub
                    </a>
                  </>
                )}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Summary</h3>
              <p className="text-sm text-slate-600 mt-1">{formData.objective}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Skills</h3>
              <p className="text-sm text-slate-600 mt-1">{formData.skills}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Education</h3>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{formData.education}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Experience</h3>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{formData.experience}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Projects</h3>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{formData.projects}</p>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-white rounded-xl max-w-sm w-full p-6 shadow-lg text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>

              <h3 className="text-lg font-bold text-slate-800">Identity Verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                Email par bheja gaya OTP enter karein ₹50 payment proceed karne ke liye.
              </p>

              {loading && step === "idle" && (
                <p className="text-sm text-blue-600 mt-4 font-medium animate-pulse">
                  OTP bheja ja raha hai...
                </p>
              )}

              {step === "otp" && (
                <div className="mt-4 space-y-4">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center tracking-widest text-lg font-bold border p-2 rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2 text-sm border rounded-md text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length < 4}
                      className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-md font-semibold disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify & Pay"}
                    </button>
                  </div>
                </div>
              )}

              {step === "download_ready" && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-emerald-600">Payment Successful! PDF Generated.</p>
                  <a
                    href={downloadLink}
                    download="resume.pdf"
                    className="block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition"
                  >
                    Click to Download PDF
                  </a>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}