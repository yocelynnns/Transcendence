import { Router, Request, Response, NextFunction } from "express";
import User from "../db/user";
import jwt from "jsonwebtoken";

const router = Router();

// AUTH MIDDLEWARE
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" }); // UNAUTHORIZED
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    (req as any).userId = decoded.userId; // ATTACH USER ID
    return next(); // CONTINUE
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" }); // INVALID TOKEN
  }
};

// SIGNUP
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const user = new User({ email: email.toLowerCase(), password });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

    return res.status(201).json({ token }); // RETURN TOKEN
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" }); // SERVER ERROR
  }
});

// LOGIN
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

    return res.status(200).json({ token }); // RETURN TOKEN
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" }); // SERVER ERROR
  }
});

// GET CURRENT USER
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).select("email avatarId");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ email: user.email, avatarId: user.avatarId || null }); // RETURN USER
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" }); // SERVER ERROR
  }
});

export default router;
