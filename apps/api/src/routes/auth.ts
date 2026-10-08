import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { env } from "../lib/env";
import { requireAuth, type AccessTokenClaims } from "../middleware/auth";
import { authRateLimit } from "../middleware/rateLimit";
import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "../validators";
import {
  issueTokenPair,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
} from "../services/authTokens";
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  readCookie,
  setRefreshCookie,
} from "../lib/cookies";
import { isAppError } from "../lib/errors";

export const authRouter = Router();

authRouter.use(authRateLimit);

function isValidTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function publicUser(u: {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  xp: number;
  level: number;
  hearts: number;
  dailyXpGoal: number;
}) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    timezone: u.timezone,
    xp: u.xp,
    level: u.level,
    hearts: u.hearts,
    dailyXpGoal: u.dailyXpGoal,
  };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid body", code: "BAD_BODY", details: parsed.error.flatten() });
    }

    const tz =
      parsed.data.timezone && isValidTimeZone(parsed.data.timezone)
        ? parsed.data.timezone
        : "UTC";

    const exists = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (exists) {
      return res.status(409).json({ error: "Unable to register with these credentials" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        displayName: parsed.data.displayName,
        timezone: tz,
        streak: { create: {} },
      },
    });
    const pair = await issueTokenPair(
      { userId: user.id, email: user.email },
      { userAgent: req.get("user-agent") }
    );
    setRefreshCookie(res, pair.refreshToken);
    return res.status(201).json({ ...pair, user: publicUser(user) });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid credentials", code: "BAD_BODY" });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const pair = await issueTokenPair(
      { userId: user.id, email: user.email },
      { userAgent: req.get("user-agent") }
    );
    setRefreshCookie(res, pair.refreshToken);
    return res.json({ ...pair, user: publicUser(user) });
  })
);

/**
 * Rotate refresh → new access + refresh.
 * Accepts refreshToken in JSON body and/or httpOnly cookie `xpi_refresh` (cookie-ready).
 */
authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const parsed = refreshBodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", code: "BAD_BODY" });
    }
    const raw =
      parsed.data.refreshToken ||
      readCookie(req, REFRESH_COOKIE) ||
      "";
    if (!raw) {
      return res.status(401).json({ error: "Refresh token required", code: "REFRESH_REQUIRED" });
    }
    try {
      const result = await rotateRefreshToken(raw, {
        userAgent: req.get("user-agent"),
      });
      setRefreshCookie(res, result.refreshToken);
      return res.json(result);
    } catch (e) {
      clearRefreshCookie(res);
      if (isAppError(e)) {
        return res.status(e.status).json({ error: e.message, code: e.code });
      }
      throw e;
    }
  })
);

/** Revoke current refresh (body/cookie). Optional allDevices requires Bearer access token. */
authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const parsed = logoutBodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", code: "BAD_BODY" });
    }

    if (parsed.data.allDevices) {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized", code: "AUTH_REQUIRED" });
      }
      try {
        const claims = jwt.verify(header.slice(7), env.jwtSecret) as AccessTokenClaims;
        if (!claims.userId) {
          return res.status(401).json({ error: "Invalid token", code: "AUTH_INVALID" });
        }
        const n = await revokeAllRefreshTokens(claims.userId);
        clearRefreshCookie(res);
        return res.json({ ok: true, revoked: n });
      } catch {
        return res.status(401).json({ error: "Invalid token", code: "AUTH_INVALID" });
      }
    }

    const raw =
      parsed.data.refreshToken ||
      readCookie(req, REFRESH_COOKIE) ||
      "";
    if (raw) await revokeRefreshToken(raw);
    clearRefreshCookie(res);
    return res.json({ ok: true });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
    });
    return res.json({ user: publicUser(user) });
  })
);
