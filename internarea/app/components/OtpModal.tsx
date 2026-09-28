// app/components/OtpModal.tsx
"use client";

import React, { useState } from "react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading: boolean;
  userEmail?: string;
}

export default function OtpModal({
  isOpen,
  onClose,
  onVerify,
  onResend,
  loading,
  userEmail,
}: OtpModalProps) {
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      await onVerify(otp);
    }
  };

  const handleResend = async () => {
    setResending(true);
    await onResend();
    setResending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Chrome Security Verification
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          A login attempt has been detected from your Chrome browser. Please enter the 6-digit OTP sent to your email.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-xl tracking-widest outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            autoFocus
          />

          <button
            type="submit"
            disabled={otp.length !== 6 || loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:underline dark:text-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}