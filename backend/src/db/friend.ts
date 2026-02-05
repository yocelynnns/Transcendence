import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFriend extends Document {
  userId: Types.ObjectId;
  friendId: Types.ObjectId;
  status: "pending" | "accepted" | "blocked";
  createdAt: Date;
}

const FriendSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  friendId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "blocked"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
});

FriendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export default mongoose.model<IFriend>("Friend", FriendSchema);