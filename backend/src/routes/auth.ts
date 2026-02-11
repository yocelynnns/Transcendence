import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import * as AuthService from "../services/auth.service"

const router = Router();

// Extended AUTH request type
export interface AuthRequest extends Request {
  userId?: string;
}

// AUTH Middleware (Protects routes, verifies JWT)
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Sign Up
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { token } = await AuthService.signup({
      email,
      password,
    });

    return res.status(201).json({ token });
  } catch (err: any) {
    console.log("[POST /signup]", err);
    return res.status(400).json({
      message: err.message || "Signup failed",
    });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { token } = await AuthService.login({
      email,
      password,
    });

    return res.status(200).json({ token });
  } catch (err: any) {
    console.log("[POST /login]", err);
    return res.status(400).json({
      message: err.message || "Login failed",
    });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await AuthService.getCurrentUser(req.userId);

    return res.status(200).json(user);
  } catch (err: any) {
    console.log("[GET /me]", err);

    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

export default router;