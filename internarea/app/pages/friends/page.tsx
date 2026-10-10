"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  // 1. Fetch Friends & Pending Requests
  const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/pages/gmailloginpage");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
        setRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // 2. Respond to Friend Request (Accept / Reject)
  const handleAction = async (requestId: string, action: "accept" | "reject") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/friends/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      alert(data.message || "Action completed");
      fetchFriends();
    } catch (err) {
      alert("Action fail.");
    }
  };

  // 3. Remove / Unfriend User
  const handleUnfriend = async (friendId: string) => {
    if (!confirm("Do you really want to remove this friend?")) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/friends/remove/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message || "Friend removed successfully.");
      fetchFriends();
    } catch (err) {
      alert("Unfriend request fail.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Friends Management</h1>
        <Link href="/pages/feed" className="text-xs text-blue-600 font-semibold hover:underline">
          ← Back to Feed
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Loading...</p>
      ) : (
        <>
          {/* Section 1: Pending Requests */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Incoming Requests ({requests.length})
            </h2>

            {requests.length === 0 ? (
              <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                No pending requests found.
              </p>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div
                    key={r._id}
                    className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.requester?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{r.requester?.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(r._id, "accept")}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(r._id, "reject")}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-md font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: My Friends List */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              My Friends ({friends.length})
            </h2>

            {friends.length === 0 ? (
              <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
              You don't have any friends yet. Send friend requests to users from your feed!
              </p>
            ) : (
              <div className="space-y-2">
                {friends.map((f) => (
                  <div
                    key={f._id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <Link
                        href={`/pages/userprofile/${f._id}`}
                        className="text-sm font-semibold text-gray-800 hover:underline"
                      >
                        {f.name || "User"}
                      </Link>
                      <p className="text-xs text-gray-500">{f.email}</p>
                    </div>
                    <button
                      onClick={() => handleUnfriend(f._id)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-md"
                    >
                      Unfriend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}