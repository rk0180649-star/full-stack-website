"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"text" | "image" | "video">("text");
  const [loading, setLoading] = useState(false);

  // File select hone par Base64 me convert karna
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      setMediaType("video");
    } else if (file.type.startsWith("image/")) {
      setMediaType("image");
    } else {
      alert("Select only a photo or video.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) {
      alert("The post must contain either text or a photo/video.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/pages/gmailloginpage");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://full-stack-website-h8ju.onrender.com/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          mediaUrl: mediaFile, // Direct Base64 data
          mediaType: mediaFile ? mediaType : "text",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "The post could not be created.");
        return;
      }

      alert("Post publish ho gaya!");
      router.push("/pages/feed");
    } catch (err) {
      alert("Server error aaya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-xl font-bold text-gray-800">Public Space</h1>
        <div className="flex gap-3 text-xs text-blue-600 font-medium">
          <Link href="/pages/feed">Feed</Link>
          <Link href="/pages/friends">Friends</Link>
          <Link href="/pages/notifications">Alerts</Link>
          <Link href="/pages/profile">Profile</Link>
        </div>
      </div>

      {/* Post Box */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-4">Create a New Post</h2>

        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Post Content (with #tags and @mentions)
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Aapke vichar yahan likhein..."
              className="w-full border rounded-lg p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Direct File Selector (No URL input) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Select a Photo or Video (Direct Upload)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {/* Preview Box */}
          {mediaFile && (
            <div className="border rounded-lg p-2 bg-gray-50 relative">
              <p className="text-[10px] text-gray-400 font-bold mb-1">Selected Preview:</p>
              {mediaType === "video" ? (
                <video src={mediaFile} controls className="max-h-60 rounded mx-auto" />
              ) : (
                <img src={mediaFile} alt="preview" className="max-h-60 rounded mx-auto object-cover" />
              )}
              <button
                type="button"
                onClick={() => {
                  setMediaFile(null);
                  setMediaType("text");
                }}
                className="mt-2 text-xs text-red-500 hover:underline block mx-auto"
              >
                Remove File
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-gray-400"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}