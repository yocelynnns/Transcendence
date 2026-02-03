// db/message.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: string;      // Stored as string
  receiverId: string;    // Stored as string
  content: string;
  createdAt: Date;
  read: boolean;
}

const MessageSchema: Schema = new Schema({
  senderId: { type: String, required: true, index: true },  // String, not ObjectId
  receiverId: { type: String, required: true, index: true }, // String, not ObjectId
  content: { type: String, required: true, maxlength: 1000 },
  read: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

// Index for faster queries
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);