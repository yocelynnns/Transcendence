import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

const MessageSchema: Schema = new Schema({
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  content: { type: String, required: true, maxlength: 1000 },
  read: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);