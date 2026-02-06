import Blocked from "../db/blocked";
import Avatar from "../db/avatar";
import User from "../db/user";
import Friend from "../db/friend";

// Block a user
interface BlockUserInput {
  userId: string; 
  blockedAvatarId: string;
}

export const blockUser = async ({ userId, blockedAvatarId }: BlockUserInput) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();

  if (myAvatarId === blockedAvatarId) throw new Error("CANNOT_BLOCK_SELF");

  const friendUser = await User.findOne({ avatar: blockedAvatarId });
  if (friendUser) {
    await Friend.deleteMany({
      $or: [
        { userId, friendId: friendUser._id },
        { userId: friendUser._id, friendId: userId },
      ],
    });
  }

  try {
    await Blocked.create({
      blockerId: myAvatarId,
      blockedId: blockedAvatarId,
    });
  } catch (err: any) {
    if (err.code === 11000) throw new Error("ALREADY_BLOCKED");
    throw err;
  }
};

// Unblock a user
interface UnblockUserInput {
  userId: string;
  blockedAvatarId: string;
}

export const unblockUser = async ({ userId, blockedAvatarId }: UnblockUserInput) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();

  await Blocked.deleteOne({
    blockerId: myAvatarId,
    blockedId: blockedAvatarId,
  });

  return;
};

// Get blocked user list
export const getBlockedUsers = async (userId: string) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();

  const blocked = await Blocked.find({ blockerId: myAvatarId })
    .populate({
      path: "blockedId",
      model: "Avatar",
      select: "userName avatar characterOption",
    });

  return blocked;
};

// Check if blocked (For chat)
interface CheckIfBlockedInput {
  userId: string;
  otherAvatarId: string;
}

export const checkIfBlocked = async ({ userId, otherAvatarId }: CheckIfBlockedInput) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();

  const blocked = await Blocked.findOne({
    $or: [
      { blockerId: myAvatarId, blockedId: otherAvatarId },
      { blockerId: otherAvatarId, blockedId: myAvatarId },
    ],
  });

  return {
    isBlocked: !!blocked,
    blockedBy: blocked ? blocked.blockerId : null,
  };
};

// Get public view (view another user's profile)
interface GetPublicProfileInput {
  userId: string;
  targetAvatarId: string;
}

export const getPublicProfile = async ({ userId, targetAvatarId }: GetPublicProfileInput) => {
  const currentUser = await User.findById(userId);
  if (!currentUser?.avatar) throw new Error("AVATAR_NOT_FOUND");

  const myAvatarId = currentUser.avatar.toString();

  const isBlocked = await Blocked.findOne({
    $or: [
      { blockerId: myAvatarId, blockedId: targetAvatarId },
      { blockerId: targetAvatarId, blockedId: myAvatarId },
    ],
  });
  if (isBlocked) throw new Error("PROFILE_BLOCKED");

  const profile = await Avatar.findById(targetAvatarId)
    .select(
      "userName avatar characterOption battleWin battleLoss raceWin raceLoss guild pokemonInventory"
    )
    .populate("guild", "name image")
    .lean();
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  const targetUser = await User.findOne({ avatar: targetAvatarId });
  let friendshipStatus = "none";
  if (targetUser) {
    const friendRecord = await Friend.findOne({
      $or: [
        { userId, friendId: targetUser._id },
        { userId: targetUser._id, friendId: userId },
      ],
      status: "accepted",
    });
    if (friendRecord) friendshipStatus = "friend";
  }

  return {
    ...profile,
    friendshipStatus,
    isMe: myAvatarId === targetAvatarId,
  };
};