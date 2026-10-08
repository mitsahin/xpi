import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";
import { AppError } from "../lib/errors";

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AccessTokenClaims extends AuthPayload {
  typ?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", code: "AUTH_REQUIRED" });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenClaims;
    if (!payload?.userId || !payload?.email) {
      return res.status(401).json({ error: "Invalid token", code: "AUTH_INVALID" });
    }
    // Reject refresh-shaped JWTs if we ever minted them; access only.
    if (payload.typ && payload.typ !== "access") {
      return res.status(401).json({ error: "Invalid token", code: "AUTH_INVALID" });
    }
    req.auth = { userId: payload.userId, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token", code: "AUTH_INVALID" });
  }
}

/** Sign a short-lived access JWT. Prefer `signAccessToken`; `signToken` kept as alias. */
export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign({ ...payload, typ: "access" }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

/** @deprecated Use signAccessToken — alias for existing call sites. */
export function signToken(payload: AuthPayload): string {
  return signAccessToken(payload);
}

/** Assert a resource belongs to the authenticated user (AuthZ helper). */
export function assertOwner(
  resourceUserId: string,
  authUserId: string,
  label = "Resource"
) {
  if (resourceUserId !== authUserId) {
    throw new AppError(`${label} not found`, 404, "NOT_FOUND");
  }
}
