const mongoose = require("mongoose");
const User = require("../Model/User");
const Post = require("../Model/Post");
const Friendship = require("../Model/Friendship");
const Notification = require("../Model/Notification");

const EDIT_TIME_LIMIT_MINUTES = 15;

// HELPER FUNCTION: Resolves any User ID (Google UID / Custom ID) to MongoDB ObjectId

const resolveMongoUserId = async (reqUser) => {
  if (!reqUser) return null;
  const rawId = reqUser.id || reqUser._id;
  const email = reqUser.email;

  // Agar ID pehle se valid 24-character hexadecimal MongoDB ObjectId hai
  if (mongoose.Types.ObjectId.isValid(rawId)) {
    return rawId;
  }

  // Agar Google/Firebase string UID hai, toh database se user match ya create karega
  let existingUser = await User.findOne({
    $or: [
      { email: email },
      { googleId: rawId },
      { firebaseUid: rawId },
    ],
  });

  if (!existingUser && email) {
    existingUser = await User.create({
      email: email,
      name: email.split("@")[0],
      googleId: rawId,
    });
  }

  return existingUser ? existingUser._id : null;
};

/* this code  for testing  */
/*
exports.createPost = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType, privacy } = req.body;
    const authorId = await resolveMongoUserId(req.user);

    if (!authorId) {
      return res.status(400).json({ error: "User account MongoDB me nahi mila." });
    }

    // [TESTING MODE] Temporary Friend Count:
    const friendCount = 5; 
 

    /* 
    // [ORIGINAL CODE - PRODUCTION KE LIYA BACKUP]
    const friendCount = await Friendship.countDocuments({
      $or: [{ requester: authorId }, { recipient: authorId }],
      status: "accepted",
    });
    */
/*
    // Step B: Aaj ke kiye gaye posts count nikalo (authorId use karein)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayPostsCount = await Post.countDocuments({
      author: authorId,
      createdAt: { $gte: startOfDay },
    });

    // Step C: Limit Validation Rules
    if (friendCount === 0) {
      return res.status(403).json({ error: "Posting ke liye kam se kam 1 friend hona zaroori hai." });
    }
    if (friendCount === 1 && todayPostsCount >= 1) {
      return res.status(403).json({ error: "1 friend par daily limit sirf 1 post hai." });
    }
    if (friendCount >= 2 && friendCount <= 5 && todayPostsCount >= 2) {
      return res.status(403).json({ error: "2-5 friends par daily limit 2 posts hai." });
    }
    if (friendCount >= 6 && friendCount <= 10 && todayPostsCount >= 5) {
      return res.status(403).json({ error: "6-10 friends par daily limit 5 posts hai." });
    }
    // Friend count > 10 hone par unlimited post allowed hai

    // Step D: Extract #hashtags aur @mentions
    const hashtags = content ? content.match(/#\w+/g) || [] : [];
    const mentions = content ? (content.match(/@\w+/g) || []).map((m) => m.slice(1)) : [];

    // Step E: Post save karo (author: authorId ke sath)
    const post = await Post.create({
      author: authorId,
      content,
      mediaUrl,
      mediaType: mediaType || "text",
      hashtags,
      mentions,
      friendCountAtPosting: friendCount,
      privacy: privacy || "public",
    });

    const populatedPost = await Post.findById(post._id).populate("author", "name email");

    res.status(201).json({ message: "Post successfully created!", post: populatedPost });
  } catch (err) {
    console.error("createPost Error:", err);
    res.status(500).json({ error: err.message });
  }
};*/

// With Full Real Friend Logic
exports.createPost = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType, privacy } = req.body;
    const authorId = await resolveMongoUserId(req.user);

    if (!authorId) {
      return res.status(400).json({ error: "User account in MongoDB not found." });
    }

    const friendCount = await Friendship.countDocuments({
      $or: [{ requester: authorId }, { recipient: authorId }],
      status: "accepted",
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayPostsCount = await Post.countDocuments({
      author: authorId,
      createdAt: { $gte: startOfDay },
    });

    if (friendCount === 0) {
      return res.status(403).json({ error: "You must have at least one friend to create a post." });
    }
    if (friendCount === 1 && todayPostsCount >= 1) {
      return res.status(403).json({ error: "With only 1 friend, the daily posting limit is 1 post." });
    }
    if (friendCount >= 2 && friendCount <= 5 && todayPostsCount >= 2) {
      return res.status(403).json({ error: "Users with 2 to 5 friends can create up to 2 posts per day." });
    }
    if (friendCount >= 6 && friendCount <= 10 && todayPostsCount >= 5) {
      return res.status(403).json({ error: "Users with 6 to 10 friends can create up to 5 posts per day." });
    }

    const hashtags = content ? content.match(/#\w+/g) || [] : [];
    const mentions = content ? (content.match(/@\w+/g) || []).map((m) => m.slice(1)) : [];

    const post = await Post.create({
      author: authorId,
      content,
      mediaUrl,
      mediaType: mediaType || "text",
      hashtags,
      mentions,
      friendCountAtPosting: friendCount,
      privacy: privacy || "public",
    });

    const populatedPost = await Post.findById(post._id).populate("author", "name email");
    res.status(201).json({ message: "Post successfully created!", post: populatedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET FEED Public & Logged-in Safe
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user ? await resolveMongoUserId(req.user) : null;
    const { type } = req.query;

    // Logged-in user ka document nikaalein taaki following list pata chal sake
    let loggedInUser = null;
    if (userId) {
      loggedInUser = await User.findById(userId).select("following");
    }
    const myFollowingList = loggedInUser?.following?.map((id) => id.toString()) || [];

    // Query setup
    let query = { $or: [{ privacy: "public" }, { privacy: { $exists: false } }] };

    // 1. FRIENDS TAB
    if (type === "friends") {
      if (!userId) {
        return res.status(200).json([]);
      }

      const friendships = await Friendship.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: "accepted",
      });
      const friendIds = friendships.map((f) =>
        f.requester.toString() === userId.toString() ? f.recipient : f.requester
      );
      query = { author: { $in: friendIds } };
    }

    // 2. Query Builder: Trending vs Normal Feed
    let postQuery = Post.find(query)
      .populate("author", "name email followers following")
      .populate("comments.user", "name email");

    if (type === "trending") {
      postQuery = postQuery.sort({ sharesCount: -1, createdAt: -1 }).limit(20);
    } else {
      postQuery = postQuery.sort({ createdAt: -1 }).limit(30);
    }

    const posts = await postQuery.lean();

    // 3. Increment Views (Saari fetched posts ka viewsCount +1 karega)
    if (posts && posts.length > 0) {
      const postIds = posts.map((p) => p._id);
      await Post.updateMany({ _id: { $in: postIds } }, { $inc: { viewsCount: 1 } });
    }

    // 4. Har post ke sath isFollowing aur followersCount attach karein
    const formattedPosts = posts.map((post) => {
      const authorId = post.author?._id?.toString() || post.author?.toString();
      const isFollowing = myFollowingList.includes(authorId);
      const followersCount = Array.isArray(post.author?.followers) ? post.author.followers.length : 0;

      return {
        ...post,
        viewsCount: (post.viewsCount || 0) + 1, // Response me turant updated view count dikhega
        isFollowing,
        followersCount,
      };
    });

    return res.status(200).json(formattedPosts);
  } catch (err) {
    console.error("getFeed error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. LIKE POST
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveMongoUserId(req.user);

    if (!userId) {
      return res.status(401).json({ error: "User account not found." });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const isLiked = post.likes.some((uid) => uid.toString() === userId.toString());
    if (isLiked) {
      post.likes = post.likes.filter((uid) => uid.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
      // Post author ko notification bhejo
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          postId: post._id,
        });
      }
    }

    await post.save();
    res.status(200).json({ likesCount: post.likes.length, isLiked: !isLiked });
  } catch (err) {
    console.error("likePost Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 4. EDIT POST (15-min limit)
exports.editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveMongoUserId(req.user);

    if (!userId) {
      return res.status(401).json({ error: "User account not found." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only edit your own post." });
    }

    const diffMinutes = (Date.now() - new Date(post.createdAt)) / (1000 * 60);
    if (diffMinutes > EDIT_TIME_LIMIT_MINUTES) {
      return res.status(403).json({ error: "You can edit the post only within 15 minutes." });
    }

    post.content = req.body.content || post.content;
    await post.save();
    res.status(200).json({ message: "Post updated!", post });
  } catch (err) {
    console.error("editPost Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 5. DELETE POST (15-min limit)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveMongoUserId(req.user);

    if (!userId) {
      return res.status(401).json({ error: "User account not found." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only delete your own post." });
    }

    const diffMinutes = (Date.now() - new Date(post.createdAt)) / (1000 * 60);
    if (diffMinutes > EDIT_TIME_LIMIT_MINUTES) {
      return res.status(403).json({ error: "You can delete the post within just 15 minutes." });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post delete succefully!" });
  } catch (err) {
    console.error("deletePost Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 6. REPORT POST
exports.reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = await resolveMongoUserId(req.user);

    if (!userId) {
      return res.status(401).json({ error: "User account not found." });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    if (!post.reports) post.reports = [];
    post.reports.push({
      reportedBy: userId,
      reason: reason || "Inappropriate Content",
      reportedAt: new Date(),
    });

    await post.save();
    res.status(200).json({ message: "Post successfully reported!" });
  } catch (err) {
    console.error("reportPost Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 7. GET REPORTED POSTS
exports.getReportedPosts = async (req, res) => {
  try {
    const reportedPosts = await Post.find({ "reports.0": { $exists: true } })
      .populate("author", "name email")
      .populate("reports.reportedBy", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json(reportedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 8. DISMISS REPORT
exports.dismissReport = async (req, res) => {
  try {
    const { postId } = req.params;
    await Post.findByIdAndUpdate(postId, { $set: { reports: [] } });
    res.status(200).json({ message: "Reports clear." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9. ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; // post id
    const { text } = req.body;
    const userId = await resolveMongoUserId(req.user);

    if (!userId) {
      return res.status(401).json({ error: "User account not found." });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text cannot be empty." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const newComment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Post author ko notification bhejo
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "comment",
        postId: post._id,
      });
    }

    const updatedPost = await Post.findById(id).populate("comments.user", "name email");

    res.status(201).json({
      message: "Comment add ho gaya!",
      comments: updatedPost.comments,
    });
  } catch (err) {
    console.error("addComment Error:", err);
    res.status(500).json({ error: err.message });
  }
};