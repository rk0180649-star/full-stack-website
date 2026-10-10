const mongoose = require("mongoose");
const Friendship = require("../Model/Friendship");
const Notification = require("../Model/Notification");
const User = require("../Model/User");

// Helper: Kisi bhi User ID (Google UID ya Email ID) ko MongoDB ObjectId me convert karega
const resolveMongoUserId = async (rawId, email) => {
  if (!rawId) return null;
  if (mongoose.Types.ObjectId.isValid(rawId)) {
    return rawId;
  }

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

// 1. FOLLOW / UNFOLLOW TOGGLE
exports.toggleFollow = async (req, res) => {
  try {
    const currentUserId = await resolveMongoUserId(req.user.id, req.user.email);
    const targetUserId = await resolveMongoUserId(req.params.targetUserId);

    if (!currentUserId || !targetUserId) {
      return res.status(404).json({ error: "User account not found." });
    }

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    // Target user ko database se check karega
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found." });
    }

    // Check karein ki kya target user ke followers me already logged-in user hai
    const followersList = targetUser.followers || [];
    const isAlreadyFollowing = followersList.some(
      (id) => id.toString() === currentUserId.toString()
    );

    if (isAlreadyFollowing) {
      // UNFOLLOW: Followers aur Following dono se pull karega
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
      });

      const updatedTarget = await User.findByIdAndUpdate(
        targetUserId,
        { $pull: { followers: currentUserId } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        following: false,
        followersCount: updatedTarget.followers ? updatedTarget.followers.length : 0,
        message: "Unfollowed successfully.",
      });
    } else {
      // FOLLOW: Followers aur Following dono me add karega ( duplicate nahi hone deta)
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId },
      });

      const updatedTarget = await User.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { followers: currentUserId } },
        { new: true }
      );

      // Safe Notification Call
      try {
        await Notification.create({
          recipient: targetUserId,
          sender: currentUserId,
          type: "follow",
          message: "started following you.",
        });
      } catch (notifErr) {
        console.warn("Notification error:", notifErr.message);
      }

      return res.status(200).json({
        success: true,
        following: true,
        followersCount: updatedTarget.followers ? updatedTarget.followers.length : 0,
        message: "Aapne follow kar liya!",
      });
    }
  } catch (err) {
    console.error("toggleFollow error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. SEND FRIEND REQUEST
exports.sendRequest = async (req, res) => {
  try {
    const requesterId = await resolveMongoUserId(req.user.id, req.user.email);
    const recipientId = await resolveMongoUserId(req.body.recipientId);

    if (!requesterId || !recipientId) {
      return res.status(404).json({ error: "User profile not found." });
    }

    if (requesterId.toString() === recipientId.toString()) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself." });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ error: "You are already friends." });
      }
      return res.status(400).json({ error: "Friend request already pending." });
    }

    const request = await Friendship.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    await Notification.create({
      recipient: recipientId,
      sender: requesterId,
      type: "friend_request",
      message: "sent you a friend request.",
    });

    res.status(201).json({ message: "Friend request sent successfully!", request });
  } catch (err) {
    console.error("sendRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. ACCEPT / REJECT FRIEND REQUEST
exports.respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = await resolveMongoUserId(req.user.id, req.user.email);

    if (!userId) {
      return res.status(401).json({ error: "User account not found." });
    }

    const request = await Friendship.findOne({ _id: requestId, recipient: userId });
    if (!request) {
      return res.status(404).json({ error: "Request not found or you are not authorized to perform this action." });
    }

    if (action === "accept") {
      request.status = "accepted";
      await request.save();

      await Notification.create({
        recipient: request.requester,
        sender: userId,
        type: "friend_accept",
        message: "friend request accepted.",
      });

      return res.status(200).json({ message: "Friend request accepted!" });
    } else {
      await Friendship.findByIdAndDelete(requestId);
      return res.status(200).json({ message: "Friend request rejected." });
    }
  } catch (err) {
    console.error("respondRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 4. GET FRIENDS & PENDING REQUESTS
exports.getMyFriends = async (req, res) => {
  try {
    const userId = await resolveMongoUserId(req.user.id, req.user.email);

    if (!userId) {
      return res.status(200).json({ friends: [], pendingRequests: [], friendCount: 0 });
    }

    const pendingRequests = await Friendship.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "name email");

    const acceptedDocs = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    }).populate("requester recipient", "name email");

    const friends = acceptedDocs.map((doc) => {
      const isRequester = doc.requester._id.toString() === userId.toString();
      return isRequester ? doc.recipient : doc.requester;
    });

    res.status(200).json({
      friends,
      pendingRequests,
      friendCount: friends.length,
    });
  } catch (err) {
    console.error("getMyFriends error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 5. UNFRIEND / REMOVE FRIEND
exports.removeFriend = async (req, res) => {
  try {
    const userId = await resolveMongoUserId(req.user.id, req.user.email);
    const targetUserId = await resolveMongoUserId(req.params.targetUserId);

    if (!userId || !targetUserId) {
      return res.status(404).json({ error: "User record not found." });
    }

    const deleted = await Friendship.findOneAndDelete({
      $or: [
        { requester: userId, recipient: targetUserId },
        { requester: targetUserId, recipient: userId },
      ],
      status: "accepted",
    });

    if (!deleted) {
      return res.status(404).json({ error: "Friendship record not found." });
    }

    res.status(200).json({ message: "Friend removed." });
  } catch (err) {
    console.error("removeFriend error:", err);
    res.status(500).json({ error: err.message });
  }
};