import mongoose, { Schema, Document } from "mongoose";

export interface IBlocked extends Document {
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

const BlockedSchema: Schema = new Schema({
  blockerId: { type: String, required: true, index: true },
  blockedId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

BlockedSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export default mongoose.model<IBlocked>("Blocked", BlockedSchema);