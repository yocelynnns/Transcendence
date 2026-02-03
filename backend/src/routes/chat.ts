import { Router } from "express";
import Message from "../db/message";
import Avatar from "../db/avatar";
import User from "../db/user";
import Friend from "../db/friend";
import { authMiddleware, AuthRequest } from "./auth";

const router = Router();

// GET CHAT HISTORY WITH A FRIEND
router.get("/:friendAvatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const friendAvatarId = Array.isArray(req.params.friendAvatarId) 
      ? req.params.friendAvatarId[0] 
      : req.params.friendAvatarId;
      
    const { page = 1, limit = 50 } = req.query;

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
    res.status(404).json({ message: "Avatar not found" });
    return;
    }

    const myAvatarId = currentUser.avatar.toString();

    // Find the user who owns the friend's avatar
    const friendUser = await User.findOne({ avatar: friendAvatarId });
    if (!friendUser) {
    res.status(404).json({ message: "Friend user not found" });
    return;
    }
    const friendUserId = friendUser._id.toString();

    // Now check friendship using userIds, not avatarIds
    const friendship = await Friend.findOne({
    $or: [
        { userId: req.userId, friendId: friendUserId },
        { userId: friendUserId, friendId: req.userId },
    ],
    status: "accepted",
    });

    if (!friendship) {
      res.status(403).json({ message: "Not friends with this user" });
      return;
    }

    // QUERY USING STRINGS (since that's how they're stored)
    const messages = await Message.find({
      $or: [
        { senderId: myAvatarId, receiverId: friendAvatarId },
        { senderId: friendAvatarId, receiverId: myAvatarId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean();

    // Mark unread messages as read - also using strings
    await Message.updateMany(
      { senderId: friendAvatarId, receiverId: myAvatarId, read: false },
      { read: true }
    );

    const friendAvatar = await Avatar.findById(friendAvatarId).select("userName avatar");

    res.status(200).json({
      messages: messages.reverse(),
      friend: {
        avatarId: friendAvatarId,
        userName: friendAvatar?.userName || "Unknown",
        avatarImage: friendAvatar?.avatar || "",
      },
      pagination: {
        page: +page,
        limit: +limit,
        hasMore: messages.length === +limit,
      },
    });
    return;
  } catch (err) {
    console.error("[GET /chat/:friendAvatarId] error:", err);
    res.status(500).json({ message: "Failed to fetch chat history" });
    return;
  }
});

// SEND MESSAGE (HTTP fallback)
router.post("/:friendAvatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const friendAvatarId = Array.isArray(req.params.friendAvatarId) 
      ? req.params.friendAvatarId[0] 
      : req.params.friendAvatarId;
      
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ message: "Message content required" });
      return;
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    // SAVE AS STRINGS (consistent with existing data)
    const message = await Message.create({
      senderId: currentUser.avatar.toString(),
      receiverId: friendAvatarId,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "userName avatar")
      .lean();

    res.status(201).json({ message: populatedMessage });
    return;
  } catch (err) {
    console.error("[POST /chat/:friendAvatarId] error:", err);
    res.status(500).json({ message: "Failed to send message" });
    return;
  }
});

// GET UNREAD MESSAGE COUNT
router.get("/unread/count", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    const myAvatarId = currentUser.avatar.toString();

    // AGGREGATE USING STRINGS
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: myAvatarId,  // String comparison
          read: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalUnread = unreadCounts.reduce((sum, item) => sum + item.count, 0);

    res.status(200).json({
      total: totalUnread,
      bySender: unreadCounts,
    });
    return;
  } catch (err) {
    console.error("[GET /chat/unread/count] error:", err);
    res.status(500).json({ message: "Failed to fetch unread count" });
    return;
  }
});

export default router;