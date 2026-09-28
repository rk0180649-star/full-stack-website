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
interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LogEntry {
  id: string;
  browser: string;
  os: string;
  deviceType: string;
  ip: string;
  location: string;
  time: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
}


const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // 1. Redux user state
  const reduxUser = useSelector(selectuser);

  // 2. Local state fallback (for email/manual login)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  //const [loading, setLoading] = useState(true);

    // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const activeUser = reduxUser || currentUser;
  const activeEmail = activeUser?.email || activeUser?.user?.email;

  // 1. Live State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Database se Real Data Fetch Karne ka Logic
  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const email = user?.email || "";

      if (!email) return;

      // Real Login History Fetch
      const logsRes = await fetch(
        `https://full-stack-website-h8ju.onrender.com/api/security/login-history?email=${email}`
      );
      const logsData = await logsRes.json();
      if (logsData.success && logsData.logs) {
        const formattedLogs = logsData.logs.map((item: any) => ({
          id: item._id,
          browser: `${item.browserName} ${item.browserVersion}`,
          os: item.os,
          deviceType: item.deviceType,
          ip: item.ipAddress,
          location: `${item.city}, ${item.country}`,
          time: new Date(item.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
          status: item.status,
        }));
        setLogs(formattedLogs);
      }

      // Real Active Sessions Fetch
      const sessionsRes = await fetch(
        `https://full-stack-website-h8ju.onrender.com/api/security/sessions?email=${email}`
      );
      const sessionsData = await sessionsRes.json();
      if (sessionsData.success && sessionsData.sessions) {
        const currentToken = localStorage.getItem("token");
        const formattedSessions = sessionsData.sessions.map((s: any) => ({
          id: s._id,
          device: `${s.deviceType} (${s.os})`,
          browser: s.browser,
          ip: s.ipAddress,
          location: s.location,
          lastActive: "Active now",
          isCurrent: s.token === currentToken, // Current device track karega
        }));
        setSessions(formattedSessions);
      }
    } catch (err) {
      console.error("Security data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Component load hote hi data fetch karega
  useEffect(() => {
    fetchSecurityData();
  }, []);

  // 3. Single Device Revoke (Database se delete karega)
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(
        `https://full-stack-website-h8ju.onrender.com/api/security/sessions/${sessionId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (err) {
      console.error("Session revoke failed:", err);
    }
  };

  // 4. Logout All Other Devices Current token chhod kar baaki delete karega
  const handleLogoutAllOther = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://full-stack-website-h8ju.onrender.com/api/security/sessions/logout-others",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?._id || user?.id }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
      }
    } catch (err) {
      console.error("Logout others failed:", err);
    }
  };

//subscribe plans
useEffect(() => {
  if (activeEmail) {
    fetch(`https://full-stack-website-h8ju.onrender.com/api/plan/subscription-status?email=${activeEmail.toLowerCase().trim()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubscription(data.subscription);
        }
      });
  }
}, [activeEmail]);


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
      router.push("/pages/gmailloginpage");
    }
    setLoading(false);
  }, [reduxUser, router]);

  // Logout Handler 
  const handleLogout = () => {
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

              {/* Subscription Banner */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-left">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Current Plan:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white uppercase">
                    {subscription?.currentPlan || "FREE"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Applications Remaining:{" "}
                  <b className="text-blue-700">
                    {subscription?.currentPlan === "GOLD"
                      ? "Unlimited"
                      : `${subscription?.applicationsLeft ?? 1} Applications`}
                  </b>
                </p>
                {subscription?.currentPlan !== "FREE" && subscription?.daysLeft > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    Valid for next {subscription.daysLeft} days
                  </p>
                )}
              </div>
              <Link
                href="/pages/pricing"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm transition"
              >
                Upgrade Plan →
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>
         <div className="space-y-8 p-6">
      {/* Active Sessions Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Sessions
            </h3>
            <p className="text-sm text-gray-500">
              Aapke account se jude sabhi devices ki list.
            </p>
          </div>
          <button
            onClick={handleLogoutAllOther}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
          >
            Log Out Other Devices
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {session.device} • {session.browser}{" "}
                  {session.isCurrent && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                      Current Device
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  IP: {session.ip} | {session.location} | Active: {session.lastActive}
                </p>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login History Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Login History & Security Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-gray-400">
              <tr>
                <th className="py-3 px-4">Device & OS</th>
                <th className="py-3 px-4">Browser</th>
                <th className="py-3 px-4">IP & Location</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
                >
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {log.deviceType} ({log.os})
                  </td>
                  <td className="py-3 px-4">{log.browser}</td>
                  <td className="py-3 px-4">
                    {log.ip} - <span className="text-xs text-gray-400">{log.location}</span>
                  </td>
                  <td className="py-3 px-4">{log.time}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        log.status === "SUCCESS"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : log.status === "BLOCKED"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    </div>
  );
};

export default Page;