"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    quota: "1 application / month",
    description: "Perfect for getting started and exploring internships.",
    features: [
      "1 Internship Application",
      "Standard Response Time",
      "Community Support",
    ],
    isPopular: false,
  },
  {
    id: "BRONZE",
    name: "Bronze",
    price: 100,
    quota: "Up to 3 applications / month",
    description: "Great for active applicants targeting specific roles.",
    features: [
      "3 Internship Applications",
      "Priority Application Queue",
      "Email Support",
      "Monthly Validity",
    ],
    isPopular: false,
  },
  {
    id: "SILVER",
    name: "Silver",
    price: 300,
    quota: "Up to 5 applications / month",
    description: "Recommended for serious candidates seeking multiple offers.",
    features: [
      "5 Internship Applications",
      "Fast Track Profile Review",
      "Priority Support",
      "Monthly Validity",
    ],
    isPopular: true,
  },
  {
    id: "GOLD",
    name: "Gold",
    price: 1000,
    quota: "Unlimited applications / month",
    description: "Maximum visibility & unlimited applications across all domains.",
    features: [
      "Unlimited Applications",
      "Direct Recruiter Highlight",
      "24/7 Dedicated Support",
      "Monthly Validity",
    ],
    isPopular: false,
  },
];

export default function PricingPage() {
  const BACKEND_URL = "https://full-stack-website-h8ju.onrender.com";
  const router = useRouter();

  // Redux user state
  const user = useSelector((state: any) => state.user?.user);

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Popup Modal States & Auto Redirect Timer
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [successData, setSuccessData] = useState<{
    planName: string;
    amount: number;
    paymentId: string;
    quota: string;
  } | null>(null);

  // Auto redirect to profile after success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccessModal && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showSuccessModal && countdown === 0) {
      router.push("/pages/profile");
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, countdown, router]);

  // Time Window Validation (5:00 AM se 11:45 AM IST)
  const isWithinAllowedTimeWindow = (): boolean => {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    const totalMinutes = istDate.getHours() * 60 + istDate.getMinutes();

    // 5:00 AM = 300 mins, 11:45 AM = 705 mins
    return totalMinutes >= 300 && totalMinutes <= 705;
  };

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    setErrorMessage(null);

    // 1. Free plan check
    if (plan.price === 0) {
      alert("Free Plan is active by default.");
      return;
    }

    // 2. User login check
    if (!user || !user.email) {
      alert("Please log in first to purchase a subscription plan!");
      router.push("/pages/gmailloginpage");
      return;
    }

    // 3. Time window check (Abhi bypass hai, launch ke waqt uncomment karein)
    if (!isWithinAllowedTimeWindow()) {
      setErrorMessage(
        "Payments are only permitted between 5:00 AM and 11:45 AM IST. Please initiate your transaction during this window."
      );
      return;
    }
    
    setLoadingPlan(plan.id);

    try {
      // 4. Create Razorpay order
      const orderRes = await fetch(`${BACKEND_URL}/api/plan/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.id) {
        throw new Error(orderData.message || "Order create error");
      }

      // 5. Razorpay popup options
      const options = {
        key: "rzp_test_TXYXVNehnLBLcI",
        amount: orderData.amount,
        currency: "INR",
        name: "Internship Subscription",
        description: `${plan.name} Plan Activation`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 6. Verify payment and update database
            const verifyRes = await fetch(`${BACKEND_URL}/api/plan/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
                amount: plan.price,
                email: user?.email || user?.user?.email,
                userId: user?._id || user?.uid || null,
              }),
            });

            const result = await verifyRes.json();

            if (result.success) {
              setSuccessData({
                planName: plan.name,
                amount: plan.price,
                paymentId: response.razorpay_payment_id,
                quota: plan.quota,
              });
              setShowSuccessModal(true);
            } else {
              alert(result.message || "Payment verification failed.");
            }
          } catch (err) {
            alert("Payment verification route is not connect.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#2563EB",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Backend server is not connect .");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Choose Your Internship Subscription Plan
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-600 text-base sm:text-lg">
            Compare plans, expand your monthly application limits, and accelerate your hiring journey.
          </p>

          <div className="mt-4 inline-block bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full">
            Payment Hours: Daily 5:00 AM to 11:45 AM IST only
          </div>

          {/* Time Window Error Banner */}
          {errorMessage && (
            <div className="mt-6 max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          {/* Pricing Cards Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border transition-all ${
                  plan.isPopular
                    ? "border-2 border-blue-600 relative shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>

                  <div className="mt-3 text-xs font-semibold text-blue-600 bg-blue-50 p-2 rounded-md">
                    {plan.quota}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`mt-8 w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition duration-200 ${
                    plan.isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  } ${loadingPlan === plan.id ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : plan.price === 0
                    ? "Current Plan"
                    : `Subscribe for ₹${plan.price}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- SUCCESS POPUP MODAL --- */}
        {showSuccessModal && successData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center border border-gray-100 animate-in fade-in zoom-in duration-150">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-sm text-gray-500 mt-1">
                Your <b>{successData.planName} Plan</b> has been activated.
              </p>

              <div className="mt-5 bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-semibold text-gray-800">₹{successData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Application Quota:</span>
                  <span className="font-semibold text-blue-600">{successData.quota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID:</span>
                  <span className="font-mono text-xs text-gray-600 truncate max-w-[150px]">
                    {successData.paymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice:</span>
                  <span className="text-xs text-green-600 font-medium">Sent to registered email</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Redirecting to profile in <span className="font-bold text-blue-600">{countdown}</span> seconds...
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/pages/profile")}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Go to Profile Now →
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-2 text-gray-600 text-sm hover:underline"
                >
                  Stay on this page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}