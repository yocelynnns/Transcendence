import mongoose from "mongoose";
import Guild from "../db/guild";
import User from "../db/user";
import Avatar, { IAvatar } from "../db/avatar";

// Create Guild
interface CreateGuildInput {
  userId: string;
  name: string;
  description?: string;
  image?: string;
}

export async function createGuild({ userId, name, description, image }: CreateGuildInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) {
    throw new Error("User must have an avatar to create a guild");
  }

  const avatar = user.avatar;

  const newGuild = await Guild.create({
    name,
    description: description || "",
    image: image || "",
    members: [{ avatar: avatar._id, role: "leader" }],
  });

  avatar.guild = newGuild._id;
  await avatar.save();

  return newGuild;
}

// Update Guild
interface UpdateGuildInput {
  userId: string;
  guildId: string;
  name?: string;
  description?: string;
  image?: string;
}

export async function updateGuild({ userId, guildId, name, description, image }: UpdateGuildInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) throw new Error("User must have an avatar to update a guild");

  const avatar = user.avatar;

  const guild = await Guild.findById(guildId);
  if (!guild) throw new Error("Guild not found");

  const member = guild.members.find((m) => m.avatar.equals(avatar._id));
  if (!member || member.role !== "leader") throw new Error("Only the guild leader can update the guild");

  if (name) guild.name = name;
  if (description) guild.description = description;
  if (image) guild.image = image;

  await guild.save();

  return guild;
}

// Join Guild
interface JoinGuildInput {
  userId: string;
  guildId: string;
}

export async function joinGuild({ userId, guildId }: JoinGuildInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) throw new Error("User must have an avatar");

  const avatar = user.avatar;

  const updatedGuild = await Guild.findOneAndUpdate(
    { _id: guildId, "members.avatar": { $ne: avatar._id } },
    { $push: { members: { avatar: avatar._id, role: "member" } } },
    { new: true }
  );
  if (!updatedGuild) throw new Error("Already a member or guild not found");

  const updatedAvatar = await Avatar.findOneAndUpdate(
    { _id: avatar._id, guild: { $exists: false } },
    { $set: { guild: guildId } },
    { new: true }
  );
  if (!updatedAvatar) throw new Error("User already in a guild");

  return updatedGuild;
}

// leave Guild
interface LeaveGuildInput {
  userId: string;
  guildId: string;
}

export async function leaveGuild({ userId, guildId }: LeaveGuildInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar || !user.avatar.guild) throw new Error("You are not in any guild");
  const avatar = user.avatar;

  if (avatar?.guild?.toString() !== guildId) {
    throw new Error("You are not a member of this guild");
  }

  const guild = await Guild.findOneAndUpdate(
    {
      _id: guildId,
      members: {
        $elemMatch: {
          avatar: avatar._id,
          role: { $ne: "leader" }
        }
      }
    },
    {
      $pull: { members: { avatar: avatar._id } }
    },
    { new: true }
  );

  if (!guild) {
    const existingGuild = await Guild.findById(guildId);
    if (!existingGuild) throw new Error("Guild not found");
    
    const member = existingGuild.members.find((m) => m.avatar.equals(avatar._id));
    if (!member) throw new Error("Member not found in guild");
    if (member.role === "leader") throw new Error("Guild leader cannot leave the guild");
    
    throw new Error("Failed to leave guild");
  }

  await Avatar.findByIdAndUpdate(
    avatar._id,
    { $unset: { guild: "" } }
  );

  return guild;
}

// Kick Member
interface KickMemberInput {
  userId: string;
  guildId: string;
  targetAvatarId: string;
}

export async function kickMember({ userId, guildId, targetAvatarId }: KickMemberInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");
  if (!mongoose.Types.ObjectId.isValid(targetAvatarId)) throw new Error("Invalid target avatar ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) throw new Error("User must have an avatar");

  const actorAvatar = user.avatar;

  const guild = await Guild.findOne({
    _id: guildId,
    "members.avatar": actorAvatar._id,
    "members.role": { $in: ["leader", "co-leader"] }
  });

  if (!guild) throw new Error("You are not authorized to kick members");

  const actorMember = guild.members.find((m) => m.avatar.equals(actorAvatar._id));
  if (!actorMember) throw new Error("Actor not found in guild");
  if (actorMember.role === "leader" && actorAvatar._id.equals(targetAvatarId)) {
    throw new Error("Leader cannot kick themselves");
  }

  const targetMember = guild.members.find((m) => m.avatar.equals(targetAvatarId));
  if (!targetMember) throw new Error("Target is not in this guild");
  if (targetMember.role === "leader") throw new Error("Cannot kick the guild leader");
  if (targetMember.role === "co-leader" && actorMember.role !== "leader") {
    throw new Error("Co-leaders cannot kick other co-leaders");
  }

  const updatedGuild = await Guild.findOneAndUpdate(
    { _id: guildId, "members.avatar": targetAvatarId },
    { $pull: { members: { avatar: targetAvatarId } } },
    { new: true }
  );

  if (!updatedGuild) throw new Error("Failed to remove member from guild");

  const updatedAvatar = await Avatar.findOneAndUpdate(
    { _id: targetAvatarId, guild: guildId },
    { $unset: { guild: "" } },
    { new: true }
  );

  if (!updatedAvatar) throw new Error("Failed to update target avatar");

  return targetAvatarId;
}


// Search All Guild
export async function getAllGuilds() {
  const guilds = await Guild.find({})
    .select("name description image members")
    .populate({
      path: "members.avatar",
      select: "userName",
    })
    .lean();

  return guilds;
}

// Get Single Guild
export async function getGuildById(guildId: string) {
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const guild = await Guild.findById(guildId).populate({
    path: "members.avatar",
    select: "userName avatar characterOption",
  });

  if (!guild) throw new Error("Guild not found");

  return guild;
}

// Delete Guild
interface DeleteGuildInput {
  userId: string;
  guildId: string;
}

export async function deleteGuild({ userId, guildId }: DeleteGuildInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) throw new Error("User must have an avatar to delete a guild");

  const avatar = user.avatar;

  const guild = await Guild.findById(guildId);
  if (!guild) throw new Error("Guild not found");

  const member = guild.members.find((m) => m.avatar.equals(avatar._id));
  if (!member || member.role !== "leader") throw new Error("Only the guild leader can delete the guild");

  await Guild.findByIdAndDelete(guild._id);

  return true;
}

// Check membership
export async function isMember({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
}): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) return false;

  const avatar = user.avatar;

  const guild = await Guild.findById(guildId);
  if (!guild) return false;

  return guild.members.some((m) => m.avatar.equals(avatar._id));
}

// Promote Member -> Co-leader
export async function promoteToCoLeader({
  userId,
  guildId,
  targetAvatarId,
}: {
  userId: string;
  guildId: string;
  targetAvatarId: string;
}) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  if (!mongoose.Types.ObjectId.isValid(targetAvatarId)) throw new Error("Invalid target avatar ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");

  if (!user || !user.avatar) throw new Error("User must have an avatar to delete a guild");

  const avatarId = user.avatar._id.toString();

  if (avatarId === targetAvatarId) {
    throw new Error("Cannot promote yourself");
  }

  const guild = await Guild.findById(guildId);
  if (!guild) throw new Error("Guild not found");

  const actor = guild.members.find(m => m.avatar.toString() === avatarId);
  if (!actor || actor.role !== "leader") {
    throw new Error("Only leader can promote members");
  }

  const target = guild.members.find(m => m.avatar.toString() === targetAvatarId);
  if (!target) throw new Error("Target member not found");

  if (target.role !== "member") {
    throw new Error("Only members can be promoted");
  }

  target.role = "co-leader";
  await guild.save();

  return guild;
}

// Demote Co-leader -> Member
export async function demoteCoLeader({
  userId,
  guildId,
  targetAvatarId,
}: {
  userId: string;
  guildId: string;
  targetAvatarId: string;
}) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");
  if (!mongoose.Types.ObjectId.isValid(targetAvatarId)) throw new Error("Invalid target avatar ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");

  if (!user || !user.avatar) throw new Error("User must have an avatar to delete a guild");

  const avatarId = user.avatar._id.toString();

  if (avatarId === targetAvatarId) {
    throw new Error("Cannot promote yourself");
  }

  const guild = await Guild.findById(guildId);
  if (!guild) throw new Error("Guild not found");

  const actor = guild.members.find(m => m.avatar.toString() === avatarId);
  if (!actor || actor.role !== "leader") {
    throw new Error("Only leader can demote co-leaders");
  }

  const target = guild.members.find(m => m.avatar.toString() === targetAvatarId);
  if (!target) throw new Error("Target member not found");

  if (target.role !== "co-leader") {
    throw new Error("Only co-leaders can be demoted");
  }

  target.role = "member";
  await guild.save();

  return guild;
}
