import { createHash, randomBytes } from "crypto";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";
import { AppError } from "../lib/errors";
import { signAccessToken, type AuthPayload } from "../middleware/auth";

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function refreshExpiresAt(): Date {
  return new Date(Date.now() + env.jwtRefreshMs);
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

/** Issue opaque refresh token; persist only the hash. */
export async function issueRefreshToken(
  userId: string,
  opts?: { userAgent?: string | null }
): Promise<string> {
  const raw = randomBytes(48).toString("base64url");
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt: refreshExpiresAt(),
      userAgent: opts?.userAgent?.slice(0, 200) || null,
    },
  });
  return raw;
}

export async function issueTokenPair(
  payload: AuthPayload,
  opts?: { userAgent?: string | null }
) {
  const accessToken = signAccessToken(payload);
  const refreshToken = await issueRefreshToken(payload.userId, opts);
  return {
    accessToken,
    refreshToken,
    /** Backward-compatible alias for access token. */
    token: accessToken,
    expiresIn: env.jwtExpiresSeconds,
    tokenType: "Bearer" as const,
  };
}

/**
 * Rotate refresh token (one-time use).
 * Reuse of a revoked token revokes all active tokens for that user.
 */
export async function rotateRefreshToken(
  rawRefresh: string,
  opts?: { userAgent?: string | null }
) {
  const tokenHash = hashToken(rawRefresh);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!existing) {
    throw new AppError("Invalid refresh token", 401, "REFRESH_INVALID");
  }

  if (existing.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError("Refresh token revoked", 401, "REFRESH_REUSE");
  }

  if (existing.expiresAt.getTime() <= Date.now()) {
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });
    throw new AppError("Refresh token expired", 401, "REFRESH_EXPIRED");
  }

  const payload: AuthPayload = {
    userId: existing.user.id,
    email: existing.user.email,
  };
  const accessToken = signAccessToken(payload);
  const newRaw = randomBytes(48).toString("base64url");
  const newHash = hashToken(newRaw);

  await prisma.$transaction(async (tx) => {
    const next = await tx.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: newHash,
        expiresAt: refreshExpiresAt(),
        userAgent: opts?.userAgent?.slice(0, 200) || existing.userAgent,
      },
    });
    await tx.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedById: next.id },
    });
  });

  return {
    accessToken,
    refreshToken: newRaw,
    token: accessToken,
    expiresIn: env.jwtExpiresSeconds,
    tokenType: "Bearer" as const,
    user: publicUser(existing.user),
  };
}

export async function revokeRefreshToken(rawRefresh: string): Promise<boolean> {
  const tokenHash = hashToken(rawRefresh);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!existing || existing.revokedAt) return false;
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });
  return true;
}

export async function revokeAllRefreshTokens(userId: string): Promise<number> {
  const result = await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

export function hashRefreshTokenForTests(raw: string): string {
  return hashToken(raw);
}
