import mongoose, { Schema, Document, Types, Query } from "mongoose";
import Avatar from "./avatar";

export interface IGuildMember {
  avatar: Types.ObjectId;      // Reference to Avatar
  role: "leader" | "officer" | "member";
}

export interface IGuild extends Document {
  name: string;
  description: string;
  image: string;               // Guild image URL/Base64
  members: IGuildMember[];
}

const GuildSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  members: [{
    avatar: { type: Schema.Types.ObjectId, ref: "Avatar", required: true },
    role: { type: String, enum: ["leader", "officer", "member"], default: "member" }
  }]
}, { timestamps: true });

GuildSchema.pre("findOneAndDelete", async function (this: Query<any, any>) {
  try {
    const guildId = this.getQuery()["_id"];
    if (!guildId) return;

    await Avatar.updateMany({ guild: guildId }, { $unset: { guild: "" } });
  } catch (err) {
    console.error("Error clearing avatars' guild field:", err);
  }
});

export default mongoose.model<IGuild>("Guild", GuildSchema);
