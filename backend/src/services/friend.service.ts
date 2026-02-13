import Friend from "../db/friend";
import User from "../db/user";
import Avatar from "../db/avatar";
import Battle from "../db/battle";
import { Types } from "mongoose";

// Add socket io instance
let ioInstance: any = null;

export function setSocketIo(io: any) {
  ioInstance = io;
}

// Send friend request
interface SendFriendRequestInput {
  userId: string;
  friendEmail: string;
}

export const sendFriendRequest = async ({ userId, friendEmail }: SendFriendRequestInput) => {
  const friendUser = await User.findOne({ email: friendEmail.toLowerCase() });
  if (!friendUser) throw new Error("USER_NOT_FOUND");

  if (friendUser._id.toString() === userId) throw new Error("CANNOT_ADD_SELF");

  const existingFriendship = await Friend.findOne({
    $or: [
      { userId, friendId: friendUser._id },
      { userId: friendUser._id, friendId: userId },
    ],
  });

  if (existingFriendship) {
    switch (existingFriendship.status) {
      case "accepted":
        throw new Error("ALREADY_FRIENDS");
      case "pending":
        if (existingFriendship.userId.toString() === friendUser._id.toString()) {
          // B is accepting A's request by sending a request back
          existingFriendship.status = "accepted";
          await existingFriendship.save();

          await Friend.create({
            userId,
            friendId: friendUser._id,
            status: "accepted",
          });

          const currentUser = await User.findById(userId).populate("avatar");
          const accepterAvatar = await Avatar.findById(friendUser.avatar);
          
          const requesterUser = await User.findById(friendUser._id).populate("avatar");
          const requesterAvatar = await Avatar.findById(requesterUser?.avatar);

          // Emit to requester (A) that their request was auto-accepted
          if (ioInstance && requesterAvatar?.currentSocket) {
            ioInstance.to(requesterAvatar.currentSocket).emit("friendRequestAutoAccepted", {
              avatarId: friendUser.avatar?.toString(),
              userName: accepterAvatar?.userName || "Unknown",
              avatarImage: accepterAvatar?.avatar || "",
            });
          }

          // Emit to accepter (B) to refresh their friend list
          if (ioInstance && accepterAvatar?.currentSocket) {
            ioInstance.to(accepterAvatar.currentSocket).emit("friendRequestAcceptedByOther", {
              avatarId: currentUser?.avatar?._id?.toString(),
              userName: requesterAvatar?.userName || "Unknown",
              avatarImage: requesterAvatar?.avatar || "",
              message: "accepted your friend request",
            });
          }

          return {
            message: "Friend request accepted",
            autoAccepted: true,
            targetAvatarId: currentUser?.avatar?._id?.toString(),
            accepterInfo: {
              avatarId: friendUser.avatar?.toString(),
              userName: accepterAvatar?.userName || "Unknown",
              avatarImage: accepterAvatar?.avatar || "",
            },
          };
        }
        throw new Error("REQUEST_ALREADY_SENT");
      case "blocked":
        throw new Error("USER_BLOCKED");
    }
  }

  const friendRequest = await Friend.create({
    userId,
    friendId: friendUser._id,
    status: "pending",
  });

  // Declare these variables BEFORE using them in socket emit
  const requesterUser = await User.findById(userId).populate("avatar");
  const requesterAvatar = await Avatar.findById(requesterUser?.avatar);

  // NEW: Emit socket event directly to recipient!
  const recipientAvatar = await Avatar.findById(friendUser.avatar);
  if (ioInstance && recipientAvatar?.currentSocket) {
    ioInstance.to(recipientAvatar.currentSocket).emit("friendRequestReceived", {
      requestId: friendRequest._id.toString(),
      avatarId: requesterUser?.avatar?._id?.toString(),
      email: requesterUser?.email,
      userName: requesterAvatar?.userName || "Unknown",
      avatarImage: requesterAvatar?.avatar || "",
      createdAt: friendRequest.createdAt,
    });
    console.log(`📨 Friend request emitted to ${recipientAvatar.currentSocket}`);
  } else {
    console.log(`⚠️ Recipient not online or no socket: ${friendUser.avatar}`);
  }

  return {
    message: "Friend request sent",
    autoAccepted: false,
    request: friendRequest,
    targetAvatarId: friendUser.avatar?.toString(),
    requesterInfo: {
      requestId: friendRequest._id,
      avatarId: requesterUser?.avatar?._id?.toString(),
      email: requesterUser?.email,
      userName: requesterAvatar?.userName || "Unknown",
      avatarImage: requesterAvatar?.avatar || "",
      createdAt: friendRequest.createdAt,
    },
  };
};

// Accept friend request
interface AcceptFriendRequestInput {
  userId: string;
  requestId: string;
}

export const acceptFriendRequest = async ({ userId, requestId }: AcceptFriendRequestInput) => {
  if (!Types.ObjectId.isValid(requestId)) {
    throw new Error("INVALID_REQUEST_ID");
  }

  const friendRequest = await Friend.findOne({
    _id: requestId,
    friendId: userId,
    status: "pending",
  });

  if (!friendRequest) throw new Error("FRIEND_REQUEST_NOT_FOUND");

  friendRequest.status = "accepted";
  await friendRequest.save();

  await Friend.create({
    userId,
    friendId: friendRequest.userId,
    status: "accepted",
  });

  const accepterUser = await User.findById(userId).populate("avatar");
  const accepterAvatar = await Avatar.findById(accepterUser?.avatar);

  const requesterUser = await User.findById(friendRequest.userId).populate("avatar");
  const requesterAvatar = await Avatar.findById(requesterUser?.avatar);

  // Emit to the original requester that their request was accepted
  if (ioInstance && requesterAvatar?.currentSocket) {
    ioInstance.to(requesterAvatar.currentSocket).emit("friendRequestAcceptedByOther", {
      avatarId: accepterUser?.avatar?._id?.toString(),
      userName: accepterAvatar?.userName || "Unknown",
      avatarImage: accepterAvatar?.avatar || "",
      message: "accepted your friend request",
    });
  }

  return {
    message: "Friend request accepted",
    friendRequest,
    requesterAvatarId: requesterUser?.avatar?._id?.toString(),
    accepterInfo: {
      avatarId: accepterUser?.avatar?._id?.toString(),
      userName: accepterAvatar?.userName || "Unknown",
      avatarImage: accepterAvatar?.avatar || "",
    },
    requesterInfo: {
      avatarId: requesterUser?.avatar?._id?.toString(),
      email: requesterUser?.email,
      userName: requesterAvatar?.userName || "Unknown",
      avatarImage: requesterAvatar?.avatar || "",
      characterOption: requesterAvatar?.characterOption || 0,
    },
  };
};

// Reject friend request
interface RejectFriendRequestInput {
  userId: string;
  requestId: string;
}

export const rejectFriendRequest = async ({ userId, requestId }: RejectFriendRequestInput) => {
  if (!Types.ObjectId.isValid(requestId)) {
    throw new Error("INVALID_REQUEST_ID");
  }

  const friendRequest = await Friend.findOneAndDelete({
    _id: requestId,
    friendId: userId,
    status: "pending",
  });

  if (!friendRequest) throw new Error("FRIEND_REQUEST_NOT_FOUND");

  return;
};

// Remove friend
interface RemoveFriendInput {
  userId: string;
  friendAvatarId: string;
}

export const removeFriend = async ({ userId, friendAvatarId }: RemoveFriendInput) => {
  const friendUser = await User.findOne({ avatar: friendAvatarId });
  if (!friendUser) throw new Error("FRIEND_NOT_FOUND");

  const friendUserId = friendUser._id.toString();

  await Friend.deleteMany({
    $or: [
      { userId, friendId: friendUserId },
      { userId: friendUserId, friendId: userId },
    ],
  });

  // Emit to the removed friend so they can update their list
  const removerUser = await User.findById(userId).populate("avatar");
  const removerAvatar = await Avatar.findById(removerUser?.avatar);
  const removedFriendAvatar = await Avatar.findById(friendAvatarId);

  if (ioInstance && removedFriendAvatar?.currentSocket) {
    ioInstance.to(removedFriendAvatar.currentSocket).emit("removedByFriend", {
      removerAvatarId: removerUser?.avatar?._id?.toString(),
      removerName: removerAvatar?.userName || "Unknown",
      removerAvatarImage: removerAvatar?.avatar || "",
    });
  }

  return;
};

// Get all user friends
export const getAllFriendsWithAvatars = async (userId: string) => {
  const friendships = await Friend.find({
    userId,
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
          "userName avatar characterOption currentBattle"
        );
      }

      let battleStatus: "online" | "in_battle" | "viewing_results" = "online";
      let currentBattle = avatar?.currentBattle?.toString() || null;
      
      if (currentBattle) {
        try {
          const battle = await Battle.findById(currentBattle).select("endedAt");
          if (battle) {
            battleStatus = battle.endedAt ? "viewing_results" : "in_battle";
          } else {
            currentBattle = null;
            battleStatus = "online";
            await Avatar.findByIdAndUpdate(friendUser.avatar, { currentBattle: null });
          }
        } catch (err) {
          console.log(`Failed to check battle status for ${currentBattle}:`, err);
          battleStatus = "online";
        }
      }

      return {
        avatarId: friendUser.avatar?.toString() || friendUser._id.toString(),
        email: friendUser.email,
        userName: avatar?.userName || "Unknown",
        avatarImage: avatar?.avatar || "",
        characterOption: avatar?.characterOption || 0,
        currentBattle,
        battleStatus,
      };
    })
  );

  return friendsWithAvatars;
};

// Get pending friend request
export const getPendingRequests = async (userId: string) => {
  const requests = await Friend.find({
    friendId: userId,
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

  return requestsWithAvatars;
};