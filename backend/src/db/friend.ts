// FRIEND SCHEMA
import mongoose, { Schema, Document, Types } from "mongoose";

// INTERFACE
export interface IFriend extends Document {
  userId: Types.ObjectId;          // USER WHO OWNS THIS FRIEND RECORD
  friendId: Types.ObjectId;        // THE FRIEND'S USER ID
  status: "pending" | "accepted" | "blocked";
  createdAt: Date;
}

// SCHEMA
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

// COMPOUND INDEX TO PREVENT DUPLICATE FRIEND REQUESTS
FriendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export default mongoose.model<IFriend>("Friend", FriendSchema);