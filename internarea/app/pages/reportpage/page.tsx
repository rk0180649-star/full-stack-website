"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReportedPostsPage() {
  const router = useRouter();
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 1. Saare Reported Posts Fetch Karna
  const fetchReportedPosts = async () => {
    if (!token) {
      router.push("/pages/gmailloginpage");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/posts/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReportsList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  // 2. Action: Post ko Platform se Delete karna
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to permanently delete this reported post?")) return;

    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message || "Post deleted.");
      fetchReportedPosts();
    } catch {
      alert("There was an issue while deleting the post.");
    }
  };

  // 3. Action: Report Dismiss/Ignore karna (Agar report galat ho)
  const handleDismissReport = async (postId: string) => {
    try {
      const res = await fetch(`https://full-stack-website-h8ju.onrender.com/api/posts/reports/${postId}/dismiss`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message || "Report clear.");
      fetchReportedPosts();
    } catch {
      alert("There was an error dismissing the report.");
    }
  };

  return (
<div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 flex items-center gap-2">
            <span>🚨</span>
            <span>Reported Posts Panel</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review reported posts, moderation reasons, and manage content safety.
          </p>
        </div>

        <Link
          href="/pages/feed"
          className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition shadow-xs self-end sm:self-auto shrink-0"
        >
          ← Back to Feed
        </Link>
      </div>

      {/* Loading & Empty State */}
      {loading ? (
        <p className="text-center text-gray-400 py-12 text-sm">Loading reported posts...</p>
      ) : reportsList.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl p-8 sm:p-10 text-center text-gray-500 shadow-xs">
          <p className="text-base sm:text-lg font-semibold text-gray-700">No Reported Posts Found</p>
          <p className="text-xs text-gray-400 mt-1">When users flag posts from the feed, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {reportsList.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-red-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4"
            >
              {/* Post Author Info & Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Post Author
                  </span>
                  <p className="text-sm sm:text-base font-bold text-gray-800 truncate">
                    {post.author?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{post.author?.email || "No email"}</p>
                </div>

                {/* Responsive Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => handleDismissReport(post._id)}
                    className="flex-1 sm:flex-initial text-center text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition cursor-pointer"
                  >
                    Dismiss (Safe)
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="flex-1 sm:flex-initial text-center text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition shadow-xs cursor-pointer"
                  >
                    Delete Post
                  </button>
                </div>
              </div>

              {/* Reported Content Box */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-3 sm:p-3.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Content:
                </span>
                <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {post.content || "No text content"}
                </p>
                
                {post.mediaUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-neutral-900/5 flex justify-center">
                    {post.mediaType === "video" ? (
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-auto h-auto max-h-[300px] sm:max-h-[420px] max-w-full object-contain"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="reported media"
                        className="w-auto h-auto max-h-[300px] sm:max-h-[420px] max-w-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* User Reports & Reasons List */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-red-600 mb-2">
                  User Reports ({post.reports?.length || 0}):
                </p>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {post.reports?.map((rep: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs bg-red-50/70 border border-red-100 p-2 sm:p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-800">
                          {rep.reportedBy?.name || "Reporter"}:
                        </span>{" "}
                        <span className="text-red-700 font-medium break-all">"{rep.reason}"</span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 self-end sm:self-auto">
                        {rep.reportedAt ? new Date(rep.reportedAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}