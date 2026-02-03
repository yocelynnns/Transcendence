import mongoose, { Schema, Document } from "mongoose";

export interface IBlocked extends Document {
  blockerId: string;    // Avatar ID who blocked
  blockedId: string;    // Avatar ID who got blocked
  createdAt: Date;
}

const BlockedSchema: Schema = new Schema({
  blockerId: { type: String, required: true, index: true },
  blockedId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate blocks
BlockedSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export default mongoose.model<IBlocked>("Blocked", BlockedSchema);