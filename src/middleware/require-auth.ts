import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionData = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!sessionData) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = sessionData.user;
  req.session = sessionData.session;
  next();
};
