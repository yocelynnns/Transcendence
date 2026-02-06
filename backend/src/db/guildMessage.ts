import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGuildMessage extends Document {
  guild: Types.ObjectId;
  sender: Types.ObjectId;
  senderName: string;
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
