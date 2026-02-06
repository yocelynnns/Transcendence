import mongoose from "mongoose";
import Guild from "../db/guild";
import GuildMessage from "../db/guildMessage";
import User from "../db/user";
import { IAvatar } from "../db/avatar";

// Create Guild
export interface GetGuildMessagesInput {
  userId: string;
  guildId: string;
  limit?: number;
}

export async function getGuildMessages({ userId, guildId, limit = 50 }: GetGuildMessagesInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) throw new Error("Avatar not found");

  const avatar = user.avatar;

  const guild = await Guild.findById(guildId);
  if (!guild) throw new Error("Guild not found");

  const isMember = guild.members.some(m => m.avatar.equals(avatar._id));
  if (!isMember) throw new Error("Not a member of this guild");

  const messages = await GuildMessage.find({ guild: guildId })
    .sort({ createdAt: 1 })
    .limit(limit);

  return messages;
}

// Post Guild Messages
export interface SendGuildMessageInput {
  userId: string;
  guildId: string;
  text: string;
}

export async function sendGuildMessage({ userId, guildId, text }: SendGuildMessageInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!mongoose.Types.ObjectId.isValid(guildId)) throw new Error("Invalid guild ID");

  const trimmedText = text.trim();
  if (!trimmedText) throw new Error("Message cannot be empty");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) throw new Error("Avatar not found");
  const avatar = user.avatar;

  const guild = await Guild.findById(guildId);
  if (!guild) throw new Error("Guild not found");

  const isMember = guild.members.some(m => m.avatar.equals(avatar._id));
  if (!isMember) throw new Error("Not a member of this guild");

  const message = await GuildMessage.create({
    guild: guild._id,
    sender: avatar._id,
    senderName: avatar.userName,
    text: trimmedText,
  });

  return message;
}
