/**
 * Integration: refresh token issue / rotate / reuse / expiry / revoke-all.
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
  let revokeAllRefreshTokens: typeof import("../../services/authTokens").revokeAllRefreshTokens;
  let hashRefreshTokenForTests: typeof import("../../services/authTokens").hashRefreshTokenForTests;
  let userId = "";

  before(async () => {
    ({ prisma } = await import("../../lib/prisma"));
    ({
      issueTokenPair,
      rotateRefreshToken,
      revokeRefreshToken,
      revokeAllRefreshTokens,
      hashRefreshTokenForTests,
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

  it("rejects unknown refresh token as REFRESH_INVALID", async () => {
    await assert.rejects(
      () => rotateRefreshToken("totally-not-a-real-refresh-token"),
      (e: Error & { code?: string; status?: number }) =>
        e.code === "REFRESH_INVALID" && e.status === 401
    );
  });

  it("rejects expired refresh token as REFRESH_EXPIRED", async () => {
    const pair = await issueTokenPair({
      userId,
      email: "refresh-test@x-pi.test",
    });
    const tokenHash = hashRefreshTokenForTests(pair.refreshToken);
    await prisma.refreshToken.update({
      where: { tokenHash },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    await assert.rejects(
      () => rotateRefreshToken(pair.refreshToken),
      (e: Error & { code?: string; status?: number }) =>
        e.code === "REFRESH_EXPIRED" && e.status === 401
    );
  });

  it("revokeAllRefreshTokens invalidates every active device", async () => {
    const a = await issueTokenPair({ userId, email: "refresh-test@x-pi.test" });
    const b = await issueTokenPair({ userId, email: "refresh-test@x-pi.test" });

    const n = await revokeAllRefreshTokens(userId);
    assert.ok(n >= 2);

    await assert.rejects(
      () => rotateRefreshToken(a.refreshToken),
      (e: Error & { code?: string }) =>
        e.code === "REFRESH_INVALID" || e.code === "REFRESH_REUSE"
    );
    await assert.rejects(
      () => rotateRefreshToken(b.refreshToken),
      (e: Error & { code?: string }) =>
        e.code === "REFRESH_INVALID" || e.code === "REFRESH_REUSE"
    );
  });

  it("reuse of one revoked token revokes the whole family", async () => {
    const first = await issueTokenPair({
      userId,
      email: "refresh-test@x-pi.test",
    });
    const second = await rotateRefreshToken(first.refreshToken);
    // Sibling still active until reuse detection
    const sibling = await issueTokenPair({
      userId,
      email: "refresh-test@x-pi.test",
    });

    await assert.rejects(
      () => rotateRefreshToken(first.refreshToken),
      (e: Error & { code?: string }) => e.code === "REFRESH_REUSE"
    );

    // Sibling was revoked by family wipe
    await assert.rejects(
      () => rotateRefreshToken(sibling.refreshToken),
      (e: Error & { code?: string }) =>
        e.code === "REFRESH_INVALID" || e.code === "REFRESH_REUSE"
    );

    // Rotated token from before reuse is also gone
    await assert.rejects(
      () => rotateRefreshToken(second.refreshToken),
      (e: Error & { code?: string }) =>
        e.code === "REFRESH_INVALID" || e.code === "REFRESH_REUSE"
    );
  });
});
