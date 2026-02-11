import { Router } from "express";
import Friend from "../db/friend";
import User from "../db/user";
import Avatar from "../db/avatar";
import { authMiddleware, AuthRequest } from "../routes/auth";

const router = Router();

// SEND FRIEND REQUEST - FIXED
router.post("/request", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { friendEmail } = req.body;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const friendUser = await User.findOne({ email: friendEmail.toLowerCase() });
    if (!friendUser) return res.status(404).json({ message: "User not found" });
    if (friendUser._id.toString() === req.userId) {
      return res.status(400).json({ message: "Cannot add yourself as a friend" });
    }

    // Check if friendship already exists (either direction)
    const existingFriendship = await Friend.findOne({
      $or: [
        { userId: req.userId, friendId: friendUser._id },
        { userId: friendUser._id, friendId: req.userId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      if (existingFriendship.status === "pending") {
        // If the other person sent the request, accept it instead
        if (existingFriendship.userId.toString() === friendUser._id.toString()) {
          existingFriendship.status = "accepted";
          await existingFriendship.save();

          // Create reciprocal
          await Friend.create({
            userId: req.userId,
            friendId: friendUser._id,
            status: "accepted",
          });

          // Get current user's avatar info for socket notification
          const currentUser = await User.findById(req.userId).populate("avatar");
          const accepterAvatar = await Avatar.findById(friendUser.avatar);

          return res.status(200).json({ 
            message: "Friend request accepted", 
            autoAccepted: true,
            targetAvatarId: currentUser?.avatar?._id?.toString(),
            accepterInfo: {
              avatarId: friendUser.avatar?.toString(),
              userName: accepterAvatar?.userName || "Unknown",
              avatarImage: accepterAvatar?.avatar || "",
            },
          });
        }
        // Otherwise it's our own pending request
        return res.status(400).json({ message: "Friend request already sent" });
      }
      if (existingFriendship.status === "blocked") {
        return res.status(400).json({ message: "User is blocked" });
      }
    }

    // Create new friend request
    const friendRequest = await Friend.create({
      userId: req.userId,
      friendId: friendUser._id,
      status: "pending",
    });

    // Get requester info for real-time notification
    const requesterUser = await User.findById(req.userId).populate("avatar");
    const requesterAvatar = await Avatar.findById(requesterUser?.avatar);

    return res.status(201).json({ 
      message: "Friend request sent", 
      request: friendRequest,
      targetAvatarId: friendUser.avatar?.toString(), // Recipient's avatar ID
      requesterInfo: {
        requestId: friendRequest._id,
        avatarId: requesterUser?.avatar?._id?.toString(),
        email: requesterUser?.email,
        userName: requesterAvatar?.userName || "Unknown",
        avatarImage: requesterAvatar?.avatar || "",
        createdAt: friendRequest.createdAt,
      },
    });
  } catch (err) {
    console.log("[POST /friends/request] error:", err);
    return res.status(500).json({ message: "Failed to send friend request" });
  }
});

// ACCEPT FRIEND REQUEST
router.post("/accept/:requestId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendRequest = await Friend.findOne({
      _id: req.params.requestId,
      friendId: req.userId,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await Friend.create({
      userId: req.userId,
      friendId: friendRequest.userId,
      status: "accepted",
    });

    // Get accepter info (the one who accepted)
    const accepterUser = await User.findById(req.userId).populate("avatar");
    const accepterAvatar = await Avatar.findById(accepterUser?.avatar);

    // Get requester info (the one who sent the request - needs notification)
    const requesterUser = await User.findById(friendRequest.userId).populate("avatar");
    const requesterAvatar = await Avatar.findById(requesterUser?.avatar);

    return res.status(200).json({ 
      message: "Friend request accepted", 
      friendRequest,
      // Info to notify the requester (they need to refresh their list)
      requesterAvatarId: requesterUser?.avatar?._id?.toString(),
      accepterInfo: {
        avatarId: accepterUser?.avatar?._id?.toString(),
        userName: accepterAvatar?.userName || "Unknown",
        avatarImage: accepterAvatar?.avatar || "",
      },
      // Also return requester info so accepter can add to their list immediately
      requesterInfo: {
        avatarId: requesterUser?.avatar?._id?.toString(),
        email: requesterUser?.email,
        userName: requesterAvatar?.userName || "Unknown",
        avatarImage: requesterAvatar?.avatar || "",
        characterOption: requesterAvatar?.characterOption || 0,
      },
    });
  } catch (err) {
    console.log("[POST /friends/accept] error:", err);
    return res.status(500).json({ message: "Failed to accept friend request" });
  }
});

// REJECT FRIEND REQUEST
router.delete("/reject/:requestId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendRequest = await Friend.findOneAndDelete({
      _id: req.params.requestId,
      friendId: req.userId,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.log("[DELETE /friends/reject] error:", err);
    return res.status(500).json({ message: "Failed to reject friend request" });
  }
});

// REMOVE FRIEND - Now accepts avatarId
router.delete("/:friendAvatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendAvatarId = req.params.friendAvatarId;

    // Find the user who owns this avatarId
    const friendUser = await User.findOne({ avatar: friendAvatarId });
    
    if (!friendUser) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const friendUserId = friendUser._id.toString();

    // DELETE BOTH DIRECTIONS OF THE FRIENDSHIP
    await Friend.deleteMany({
      $or: [
        { userId: req.userId, friendId: friendUserId },
        { userId: friendUserId, friendId: req.userId },
      ],
    });

    return res.status(200).json({ 
      message: "Friend removed",
      removedFriendAvatarId: friendAvatarId, // Return this for socket notification
    });
  } catch (err) {
    console.log("[DELETE /friends/:friendAvatarId] error:", err);
    return res.status(500).json({ message: "Failed to remove friend" });
  }
});

// GET ALL FRIENDS WITH AVATAR DATA
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendships = await Friend.find({
      userId: req.userId,
      status: "accepted",
    }).populate({
      path: "friendId",
      select: "email avatar",
    });

    const friendsWithAvatars = await Promise.all(
      friendships.map(async (friendship: any) => {
        const friendUser = friendship.friendId;
        let avatar = null;

        if (friendUser.avatar) {
          avatar = await Avatar.findById(friendUser.avatar).select(
            "userName avatar characterOption"
          );
        }

        return {
          avatarId: friendUser.avatar?.toString() || friendUser._id.toString(),
          email: friendUser.email,
          userName: avatar?.userName || "Unknown",
          avatarImage: avatar?.avatar || "",
          characterOption: avatar?.characterOption || 0,
        };
      })
    ); 

    return res.status(200).json(friendsWithAvatars);
  } catch (err) {
    console.log("[GET /friends] error:", err);
    return res.status(500).json({ message: "Failed to get friends" });
  }
});

// GET PENDING FRIEND REQUESTS (RECEIVED)
router.get("/requests/pending", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await Friend.find({
      friendId: req.userId,
      status: "pending",
    }).populate({
      path: "userId",
      select: "email avatar",
    });

    const requestsWithAvatars = await Promise.all(
      requests.map(async (request: any) => {
        const requesterUser = request.userId;
        let avatar = null;

        if (requesterUser.avatar) {
          avatar = await Avatar.findById(requesterUser.avatar).select(
            "userName avatar"
          );
        }

        return {
          requestId: request._id,
          avatarId: requesterUser.avatar?.toString() || requesterUser._id.toString(),
          email: requesterUser.email,
          userName: avatar?.userName || "Unknown",
          avatarImage: avatar?.avatar || "",
          createdAt: request.createdAt,
        };
      })
    );

    return res.status(200).json(requestsWithAvatars);
  } catch (err) {
    console.log("[GET /friends/requests/pending] error:", err);
    return res.status(500).json({ message: "Failed to get friend requests" });
  }
});

export default router;