// AUTH MIDDLEWARE
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// EXTENDED REQUEST
export interface AuthRequest extends Request {
  userId?: string;
}

// VERIFY JWT
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" }); // NO TOKEN
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.userId = decoded.userId; // ATTACH USER ID
    next(); // CONTINUE
  } catch {
    res.status(401).json({ message: "Invalid token" }); // INVALID TOKEN
  }
};
