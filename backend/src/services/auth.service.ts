import jwt from "jsonwebtoken";
import User from "../db/user";

// Sign Up
interface SignupInput {
  email?: string;
  password?: string;
}

export const signup = async ({ email, password }: SignupInput) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const user = new User({
    email: normalizedEmail,
    password,
  });

  await user.save();

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  return { token };
};

// Login
interface LoginInput {
  email?: string;
  password?: string;
}

export const login = async ({ email, password }: LoginInput) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  return { token };
};

// Get current user
export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId)
    .select("email avatar")
    .populate({
      path: "avatar",
      populate: {
        path: "pokemonInventory",
      },
    });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    _id: user._id,
    email: user.email,
    avatar: user.avatar || null,
  };
};