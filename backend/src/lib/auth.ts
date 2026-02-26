import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "change-this-jwt-secret";

type JwtPayload = {
  userId: number;
  email: string;
  role: "user" | "admin";
};

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export type AuthRequest = Request & {
  auth?: JwtPayload;
};

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    req.auth = verifyAuthToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.auth) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  if (req.auth.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  return next();
}
