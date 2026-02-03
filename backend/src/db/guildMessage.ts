import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGuildMessage extends Document {
  guild: Types.ObjectId;       // Guild reference
  sender: Types.ObjectId;      // Avatar reference
  senderName: string;          // Denormalized for easy display
  text: string;
  createdAt: Date;
}

const GuildMessageSchema: Schema = new Schema({
  guild: { type: Schema.Types.ObjectId, ref: "Guild", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "Avatar", required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IGuildMessage>("GuildMessage", GuildMessageSchema);
