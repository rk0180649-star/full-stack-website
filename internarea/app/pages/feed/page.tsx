"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"recent" | "friends" | "trending">("recent");
  const [loading, setLoading] = useState(true);

  // UI States
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

useEffect(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("userId");
      if (!id && localStorage.getItem("user")) {
        try {
          const parsed = JSON.parse(localStorage.getItem("user") || "{}");
          id = parsed._id || parsed.id;
        } catch (e) {
          console.error(e);
        }
      }
      setCurrentUserId(id ? String(id) : null);
    }
  }, []);

  // 1. Fetch Feed (Public: Bina login ke bhi feed load hoga)
  const fetchFeed = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      setLoading(true);
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/feed?type=${activeTab}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (res.ok) {
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      }
    } catch (err) {
      console.error("Feed Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab]);

  // 2. Like Post (Login Required)
  const handleLike = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first to like this post!");
      router.push("/pages/gmailloginpage");
      return;
    }

    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Send Friend Request (Login Required)
  const handleSendFriendRequest = async (recipientId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first to send friend request!");
      router.push("/pages/gmailloginpage");
      return;
    }

    try {
      const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("A server error occurred while sending the friend request.");
    }
  };

  // 4. Follow / Unfollow User (Login Required)
const handleToggleFollow = async (targetUserId: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first!");
    return;
  }

  try {
    const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/friends/users/${targetUserId}/toggle-follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Action fail.");
      return;
    }

    // State me real-time update
    setPosts((prev) =>
      prev.map((p) => {
        const id = String(p.author?._id || p.author);
        if (id === String(targetUserId)) {
          return {
            ...p,
            isFollowing: data.following,
            followersCount: data.followersCount,
          };
        }
        return p;
      })
    );
  } catch (err) {
    console.error("Follow error:", err);
  }
};

  // 5. Edit Post (Login + 15-min limit)
  const handleEdit = async (post: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first to edit this post!");
      router.push("/pages/gmailloginpage");
      return;
    }

    const diffMinutes = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60);
    if (diffMinutes > 15) {
      alert("You can no longer edit this post after 15 minutes.");
      return;
    }

    const newContent = prompt("Post content update:", post.content);
    if (!newContent || newContent === post.content) return;

    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "The post could not be edited.");
        return;
      }
      alert(data.message || "The post has been updated successfully!");
      setOpenMenuId(null);
      fetchFeed();
    } catch (err) {
      alert("Edit request fail.");
    }
  };

  // 6. Delete Post (Login + 15-min limit)
  const handleDelete = async (post: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first to delete this post!");
      router.push("/pages/gmailloginpage");
      return;
    }

    const diffMinutes = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60);
    if (diffMinutes > 15) {
      alert("You can no longer delete this post after 15 minutes.");
      return;
    }

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/${post._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Unable to delete.");
        return;
      }
      alert(data.message || "Post deleted successfully.");
      setOpenMenuId(null);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err) {
      alert("Unable to process the delete request.");
    }
  };

  // 7. Report Post (Login Required)
  const handleReport = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first to report this post!");
      router.push("/pages/gmailloginpage");
      return;
    }

    const reason = prompt("Enter the reason for reporting (Spam, Harassment, Abuse):");
    if (!reason || !reason.trim()) return;

    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/${postId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      alert(data.message || "Post reported successfully.");
      setOpenMenuId(null);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert("Report request fail.");
    }
  };

  // 8. Add Comment (Login Required)
  const handleAddComment = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first to comment on this post!");
      router.push("/pages/gmailloginpage");
      return;
    }

    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText({ ...commentText, [postId]: "" });
        fetchFeed();
      } else {
        alert(data.error || "Unable to submit the comment.");
      }
    } catch (err: any) {
      alert(`Comment Error: ${err.message || "Request fail"}`);
    }
  };

  return (
<div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      {/* Top Header: Clean Responsive Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Public Space Feed</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Explore thoughts, photos, and updates</p>
        </div>

        {/* Action Buttons: Never Overlaps */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Link
            href="/pages/friends"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <span>👥</span>
            <span>Friends</span>
          </Link>
          <Link
            href="/pages/notifications"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <span>🔔</span>
            <span className="hidden xs:inline">Alerts</span>
          </Link>
          <Link
            href="/pages/createpost"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            <span>+</span>
            <span>Create</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-5 text-xs sm:text-sm font-medium text-gray-500">
        {(["recent", "friends", "trending"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize pb-2.5 px-3 border-b-2 font-semibold transition ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {loading ? (
        <p className="text-center text-gray-400 py-10 text-sm">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">No posts found.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const authorId = String(post.author?._id || post.author || "");
            const isMyPost = Boolean(currentUserId && authorId === currentUserId);

            return (
              <div
                key={post._id}
                className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-xs hover:shadow-sm transition"
              >
                {/* Header: Author + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                  {/* Left: Author Info + Followers Count */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/pages/userprofile/${authorId}`}
                        className="font-semibold text-gray-900 text-xs sm:text-sm hover:underline truncate max-w-[130px] sm:max-w-xs block"
                      >
                        {post.author?.name || "User"}
                      </Link>

                      {/* Followers Count */}
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/60">
                        {post.followersCount ?? (post.author?.followers?.length || 0)} Followers
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {post.friendCountAtPosting || 0} Friends • {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Right: Actions (Buttons + 3-Dots Menu) */}
                  <div className="flex items-center gap-2 sm:gap-2 shrink-0 self-end sm:self-auto">
                    {/* Add Friend Button */}
                    <button
                      onClick={() => handleSendFriendRequest(authorId)}
                      className="text-[11px] sm:text-xs bg-blue-500 text-white px-2.5 py-1 rounded-lg hover:bg-blue-600 transition"
                    >
                      +Add Friend
                    </button>

                    {/* Follow Button */}
                    <button
                      onClick={() => handleToggleFollow(authorId)}
                      className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition cursor-pointer"
                    >
                      {post.isFollowing ? "Following" : "Follow"}
                    </button>

                    {/* 3-Dots Menu Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
                        className="text-gray-400 hover:text-gray-600 px-1.5 py-0.5 text-base font-bold rounded hover:bg-gray-100"
                      >
                        ⋮
                      </button>

                      {openMenuId === post._id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                          <button
                            onClick={() => handleEdit(post)}
                            className="w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-medium"
                          >
                            ✏️ Edit (15 min)
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 font-medium"
                          >
                            🗑️ Delete Post
                          </button>
                          <button
                            onClick={() => handleReport(post._id)}
                            className="w-full text-left px-3 py-1.5 text-orange-600 hover:bg-orange-50 font-medium border-t border-gray-100"
                          >
                            ⚠️ Report Post
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                {post.content && (
                  <p className="text-gray-800 text-xs sm:text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}

                {/* Media Responsive Display (Full Image on Mobile/iPad/Desktop) */}
                {post.mediaUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-gray-100 bg-neutral-900/5 flex items-center justify-center">
                    {post.mediaType === "video" ? (
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-auto h-auto max-h-[360px] sm:max-h-[480px] md:max-h-[560px] max-w-full object-contain"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="media"
                        className="w-auto h-auto max-h-[360px] sm:max-h-[480px] md:max-h-[560px] max-w-full object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="hover:text-red-500 font-medium transition cursor-pointer"
                  >
                    ❤️ {post.likes?.length || 0} Likes
                  </button>

                  <button
                    onClick={() =>
                      setShowComments({ ...showComments, [post._id]: !showComments[post._id] })
                    }
                    className="hover:text-blue-600 font-medium transition cursor-pointer"
                  >
                    💬 {post.comments?.length || 0} Comments
                  </button>

                  <span className="flex items-center gap-1 text-gray-400 font-medium select-none ml-auto sm:ml-0">
                    👁️ {post.viewsCount || 0} Views
                  </span>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText({ ...commentText, [post._id]: e.target.value })
                        }
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
                      >
                        Post
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {post.comments?.map((c: any, index: number) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded-lg">
                          <span className="font-semibold text-gray-800">{c.user?.name || "User"}: </span>
                          <span className="text-gray-700">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}