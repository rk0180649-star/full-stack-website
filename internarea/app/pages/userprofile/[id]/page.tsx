"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!token) {
      router.push("/pages/gmailloginpage");
      return;
    }
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // Feed API se posts filter karke user ke specific posts nikalna
        const feedRes = await fetch("https://full-stack-website-h8ju.onrender.com/api/posts/feed?type=recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const feedData = await feedRes.json();
        const allPosts = Array.isArray(feedData) ? feedData : feedData.posts || [];

        // Is user ke posts filter karein
        const matchedPosts = allPosts.filter((p: any) => p.author?._id === userId);
        setUserPosts(matchedPosts);

        // Agar user ka post mila to wahan se author info lein
        if (matchedPosts.length > 0) {
          setProfile(matchedPosts[0].author);
        } else {
          setProfile({ name: "User", email: "" });
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, token]);

  // Friend Request Action
  const handleSendRequest = async () => {
    try {
      const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: userId }),
      });
      const data = await res.json();
      alert(data.message || data.error);
    } catch {
      alert("There was a problem sending the friend request.");
    }
  };

  // Follow / Unfollow Action
  const handleToggleFollow = async () => {
    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/friends/users/${userId}/toggle-follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message || (data.following ? "Followed!" : "Unfollowed!"));
      setIsFollowing(data.following);
    } catch {
      alert("Follow request fail.");
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Loading Profile...</p>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/pages/feed" className="text-xs text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Feed
      </Link>
        {/* Profile Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-6 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* User Information */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
              {profile?.name || "User"}
            </h1>
            {profile?.email && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{profile.email}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-medium">
              <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                Posts: {userPosts.length}
              </span>
              <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                Followers: {profile?.followers?.length || 0}
              </span>
            </div>
          </div>

      {/* Action Buttons */}
      {currentUserId !== userId && (
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <button
            onClick={handleSendRequest}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs px-4 py-2 rounded-xl font-medium transition text-center shadow-xs cursor-pointer"
          >
            + Add Friend
          </button>
          <button
            onClick={handleToggleFollow}
            className={`flex-1 sm:flex-none text-xs px-4 py-2 rounded-xl font-medium transition text-center border cursor-pointer ${
              isFollowing
                ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                : "border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      )}
    </div>

      {/* User's Posts */}
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Posts by {profile?.name || "User"}
      </h2>

      {userPosts.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 text-center text-xs text-gray-400">
        No public posts found for this user.
        </div>
      ) : (
    <div className="space-y-4">
      {userPosts.map((post: any) => (
        <div key={post._id} className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-800 mb-2">{post.content}</p>

          {post.mediaUrl && (
            <div className="mb-2 rounded-lg overflow-hidden border bg-black flex justify-center items-center">
              {post.mediaType === "video" ? (
                <video
                  src={post.mediaUrl}
                  controls
                  playsInline
                  className="w-full max-h-[550px] object-contain"
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt="media"
                  className="w-full max-h-[550px] object-contain"
                />
              )}
            </div>
          )}

          <div className="text-[10px] text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
      )}
    </div>
  );
}