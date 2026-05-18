import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import { HttpUnauthorizedError } from "@/lib/http-errors";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return next(new HttpUnauthorizedError());
  }

  req.user = session.user;
  req.session = session.session;
  next();
}
