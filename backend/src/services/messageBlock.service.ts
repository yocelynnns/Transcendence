import MessageBlock from "../db/messageBlock";
import User from "../db/user";
import Avatar from "../db/avatar";

export const blockMessagesFromFriend = async (userId: string, friendAvatarId: string) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();
  if (myAvatarId === friendAvatarId) throw new Error("CANNOT_BLOCK_SELF");

  try {
    await MessageBlock.create({ blockerAvatarId: myAvatarId, blockedAvatarId: friendAvatarId });
  } catch (err: any) {
    if (err.code === 11000) throw new Error("ALREADY_BLOCKED");
    throw err;
  }

  const friendAvatar = await Avatar.findById(friendAvatarId).select("userName avatar");
  return {
    message: "Messages blocked",
    blockedFriend: {
      avatarId: friendAvatarId,
      userName: friendAvatar?.userName || "Unknown",
      avatarImage: friendAvatar?.avatar || "",
    },
  };
};

export const unblockMessagesFromFriend = async (userId: string, friendAvatarId: string) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();
  const result = await MessageBlock.deleteOne({ blockerAvatarId: myAvatarId, blockedAvatarId: friendAvatarId });
  
  if (result.deletedCount === 0) throw new Error("NOT_BLOCKED");
  return { message: "Messages unblocked" };
};

export const checkMessageBlock = async (senderAvatarId: string, receiverAvatarId: string) => {
  const blockedByReceiver = await MessageBlock.findOne({
    blockerAvatarId: receiverAvatarId,
    blockedAvatarId: senderAvatarId,
  });

  const blockedBySender = await MessageBlock.findOne({
    blockerAvatarId: senderAvatarId,
    blockedAvatarId: receiverAvatarId,
  });

  return {
    isBlocked: !!(blockedByReceiver || blockedBySender),
    blockedBy: blockedByReceiver ? "receiver" : blockedBySender ? "sender" : null,
  };
};

export const getBlockedMessageFriends = async (userId: string) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();
  const blocks = await MessageBlock.find({ blockerAvatarId: myAvatarId })
    .populate({ path: "blockedAvatarId", model: "Avatar", select: "userName avatar characterOption" })
    .lean();

  return blocks.map((block: any) => ({
    blockId: block._id,
    avatarId: block.blockedAvatarId._id.toString(),
    userName: block.blockedAvatarId.userName || "Unknown",
    avatarImage: block.blockedAvatarId.avatar || "",
    characterOption: block.blockedAvatarId.characterOption || 0,
    blockedAt: block.createdAt,
  }));
};