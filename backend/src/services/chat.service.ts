import { Types } from "mongoose";
import Message from "../db/message";
import Avatar from "../db/avatar";
import User from "../db/user";
import Friend from "../db/friend";
import { checkMessageBlock } from "./messageBlock.service";

// Get chat history with a friend
interface GetChatHistoryInput {
  userId: string;
  friendAvatarId: string;
  page: number;
  limit: number;
}

export const getChatHistory = async ({
  userId,
  friendAvatarId,
  page,
  limit,
}: GetChatHistoryInput) => {
  if (!Types.ObjectId.isValid(friendAvatarId)) {
    throw new Error("INVALID_AVATAR_ID");
  }

  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) {
    throw new Error("AVATAR_NOT_FOUND");
  }

  const myAvatarId = currentUser.avatar.toString();

  const friendUser = await User.findOne({ avatar: friendAvatarId });
  if (!friendUser) {
    throw new Error("FRIEND_NOT_FOUND");
  }

  const friendUserId = friendUser._id.toString();

  const friendship = await Friend.findOne({
    $or: [
      { userId, friendId: friendUserId },
      { userId: friendUserId, friendId: userId },
    ],
    status: "accepted",
  });

  if (!friendship) {
    throw new Error("NOT_FRIENDS");
  }

  const messages = await Message.find({
    $or: [
      { senderId: myAvatarId, receiverId: friendAvatarId },
      { senderId: friendAvatarId, receiverId: myAvatarId },
    ],
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  await Message.updateMany(
    { senderId: friendAvatarId, receiverId: myAvatarId, read: false },
    { read: true }
  );

  const friendAvatar = await Avatar.findById(friendAvatarId).select("userName avatar");

  return {
    messages: messages.reverse(),
    friend: {
      avatarId: friendAvatarId,
      userName: friendAvatar?.userName || "Unknown",
      avatarImage: friendAvatar?.avatar || "",
    },
    pagination: {
      page,
      limit,
      hasMore: messages.length === limit,
    },
  };
};

// Send message to a friend
interface SendMessageInput {
  userId: string;
  friendAvatarId: string;
  content?: string;
}


export const sendMessage = async ({
  userId,
  friendAvatarId,
  content,
}: SendMessageInput) => {
  if (!Types.ObjectId.isValid(friendAvatarId)) {
    throw new Error("INVALID_AVATAR_ID");
  }

  if (!content || content.trim().length === 0) {
    throw new Error("MESSAGE_REQUIRED");
  }

  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) {
    throw new Error("AVATAR_NOT_FOUND");
  }

  const senderId = currentUser.avatar.toString();

  // CHECK BLOCK
  const blockStatus = await checkMessageBlock(senderId, friendAvatarId);
  if (blockStatus.isBlocked) {
    const error = new Error("MESSAGES_BLOCKED");
    (error as any).blockedBy = blockStatus.blockedBy;
    throw error;
  }

  const message = await Message.create({
    senderId,
    receiverId: friendAvatarId,
    content: content.trim(),
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("senderId", "userName avatar")
    .lean();

  return populatedMessage;
};

// Get unread message count
export const getUnreadMessageCount = async (userId: string) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) {
    throw new Error("AVATAR_NOT_FOUND");
  }

  const myAvatarId = currentUser.avatar.toString();

  const unreadCounts = await Message.aggregate([
    {
      $match: {
        receiverId: myAvatarId,
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

  return {
    total: totalUnread,
    bySender: unreadCounts,
  };
};

// Mark messages as read
export interface MarkMessagesReadInput {
  senderId: string;
  receiverId: string;
}

export async function markMessagesRead({ senderId, receiverId }: MarkMessagesReadInput) {
  if (!senderId || !receiverId) {
    throw new Error("Both senderId and receiverId are required");
  }

  const result = await Message.updateMany(
    { senderId, receiverId, read: false },
    { read: true }
  );

  return result;
}