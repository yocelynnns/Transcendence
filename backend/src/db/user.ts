import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { IAvatar } from "./avatar";

// USER INTERFACE
export interface IUser extends Document {
  email: string;
  password: string;
  avatar?: Types.ObjectId | IAvatar; // LINK TO AVATAR
  comparePassword: (candidate: string) => Promise<boolean>;
}

// SCHEMA
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: Schema.Types.ObjectId, ref: "Avatar", unique: true, sparse: true }, // LINK TO AVATAR
});

// HASH PASSWORD BEFORE SAVE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
