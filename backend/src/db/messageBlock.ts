import mongoose, { Schema, Document } from "mongoose";

export interface IMessageBlock extends Document {
  blockerAvatarId: string;
  blockedAvatarId: string;
  createdAt: Date;
}

const MessageBlockSchema = new Schema({
  blockerAvatarId: { type: String, required: true, index: true },
  blockedAvatarId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

MessageBlockSchema.index({ blockerAvatarId: 1, blockedAvatarId: 1 }, { unique: true });

export default mongoose.model<IMessageBlock>("MessageBlock", MessageBlockSchema);