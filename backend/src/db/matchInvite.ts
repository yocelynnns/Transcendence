import mongoose, { Schema, Document } from "mongoose";

export interface IMatchInvite extends Document {
  senderId: string;      // Avatar ID who sent invite
  receiverId: string;    // Avatar ID who receives
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

const MatchInviteSchema: Schema = new Schema({
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30000) }, // 30s expiry
});

// Auto-expire old invites
MatchInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IMatchInvite>("MatchInvite", MatchInviteSchema);