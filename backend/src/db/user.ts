import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// USER INTERFACE
export interface IUser extends Document {
  email: string;
  password: string;
  avatarId?: string; // LINK TO AVATAR
  comparePassword: (candidate: string) => Promise<boolean>;
}

// SCHEMA
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // EMAIL
  password: { type: String, required: true }, // PASSWORD
  avatarId: { type: String, unique: true, sparse: true }, // AVATAR ID
});

// HASH PASSWORD BEFORE SAVE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // SKIP IF NOT MODIFIED
  const salt = await bcrypt.genSalt(10); // SALT
  this.password = await bcrypt.hash(this.password, salt); // HASH
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password); // RETURN BOOLEAN
};

export default mongoose.model<IUser>("User", userSchema); // EXPORT MODEL
