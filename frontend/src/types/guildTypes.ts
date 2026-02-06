import type { AvatarData } from "./avatarTypes";

export type GuildMember = {
  _id: string;
  avatar:  AvatarData | string;
  role: "leader" | "co-leader" | "member";
};

export interface Guild {
  _id: string;
  name: string;
  image?: string;
  description: string;
  members: GuildMember[];
}

export interface GuildMessage {
  _id: string;
  guild: string;
  sender: string;
  senderName: string;
  text: string;
  createdAt: string;
}
