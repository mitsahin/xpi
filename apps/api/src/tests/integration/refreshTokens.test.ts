/**
 * Integration: refresh token issue / rotate / reuse detection.
 * Skips when DATABASE_URL is unset (local unit-only runs).
 */
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import bcrypt from "bcryptjs";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("refresh tokens (integration)", { skip: !hasDb }, () => {
  let prisma: typeof import("../../lib/prisma").prisma;
  let issueTokenPair: typeof import("../../services/authTokens").issueTokenPair;
  let rotateRefreshToken: typeof import("../../services/authTokens").rotateRefreshToken;
  let revokeRefreshToken: typeof import("../../services/authTokens").revokeRefreshToken;
  let userId = "";

  before(async () => {
    ({ prisma } = await import("../../lib/prisma"));
    ({
      issueTokenPair,
      rotateRefreshToken,
      revokeRefreshToken,
    } = await import("../../services/authTokens"));

    const email = `refresh-test-${Date.now()}@x-pi.test`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash("testpass1", 10),
        displayName: "Refresh Tester",
        streak: { create: {} },
      },
    });
    userId = user.id;
  });

  after(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => null);
    }
    await prisma.$disconnect();
  });

  it("issues pair, rotates once, rejects reuse", async () => {
    const pair = await issueTokenPair({
      userId,
      email: "refresh-test@x-pi.test",
    });
    assert.ok(pair.accessToken);
    assert.ok(pair.refreshToken);
    assert.equal(pair.token, pair.accessToken);

    const rotated = await rotateRefreshToken(pair.refreshToken);
    assert.ok(rotated.accessToken);
    assert.notEqual(rotated.refreshToken, pair.refreshToken);

    await assert.rejects(
      () => rotateRefreshToken(pair.refreshToken),
      (e: Error & { code?: string }) => e.code === "REFRESH_REUSE"
    );

    await revokeRefreshToken(rotated.refreshToken);
    await assert.rejects(
      () => rotateRefreshToken(rotated.refreshToken),
      (e: Error & { code?: string }) =>
        e.code === "REFRESH_INVALID" || e.code === "REFRESH_REUSE"
    );
  });
});
