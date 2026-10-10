"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 1. Fetch Notifications
  const fetchNotifications = async () => {
    if (!token) {
      router.push("/pages/gmailloginpage");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/posts/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/posts/notifications/mark-read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper text mapping based on Notification type enum
  const getNotificationText = (item: any) => {
    switch (item.type) {
      case "like":
        return "liked your post ❤️";
      case "comment":
        return "comment your post 💬";
      case "friend_request":
        return "sent you a friend request 👥";
      case "friend_accept":
        return "accepted your friend request 🎉";
      case "follow":
        return "started following you 🔔";
      default:
        return "new notification";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          <Link href="/pages/feed" className="text-xs text-blue-600 hover:underline">
            ← Back to Feed
          </Link>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
        No new notifications.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                item.isRead ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-200 font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                <Link
                  href={`/pages/userprofile/${item.sender?._id}`}
                  className="font-semibold text-sm text-gray-800 hover:underline"
                >
                  {item.sender?.name || "User"}
                </Link>
                <span className="text-xs text-gray-600">{getNotificationText(item)}</span>
              </div>

              <span className="text-[10px] text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}