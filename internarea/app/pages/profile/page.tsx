"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, ExternalLink, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectuser, logout } from "@/app/Feature/Userslice";

interface UserProfile {
  name: string;
  email: string;
  photo?: string;
}

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // 1. Redux user state
  const reduxUser = useSelector(selectuser);

  // 2. Local state fallback (for email/manual login)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redux me user ho toh use use karein
    if (reduxUser) {
      setCurrentUser(reduxUser);
      setLoading(false);
      return;
    }

    // Agar Redux me nahi hai, toh localStorage check karein
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    } else {
      // Dono me nahi hai toh Login page par redirect kar do
      router.push("/pages/gmailloginpage");
    }
    setLoading(false);
  }, [reduxUser, router]);

  // Logout Handler (Redux + LocalStorage dono clear karega)
  const handleLogout = () => {
    // Redux action dispatch (agar slice me define hai)
    if (logout) {
      dispatch(logout());
    }

    // LocalStorage clear
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login
    router.push("/pages/gmailloginpage");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            {/* Logout Button on Top Right */}
            <div className="absolute top-4 right-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>

            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {currentUser?.photo ? (
                <img
                  src={currentUser?.photo}
                  alt={currentUser?.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser?.name || "User"}
              </h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{currentUser?.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-blue-600 font-semibold text-2xl">0</span>
                  <p className="text-blue-600 text-sm mt-1">
                    Active Applications
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-green-600 font-semibold text-2xl">0</span>
                  <p className="text-green-600 text-sm mt-1">
                    Accepted Applications
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center items-center gap-4 pt-4">
                <Link
                  href={"/pages/userapplication"}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Applications
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;