import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  effectiveCurrentStreak,
  resolveStreakTransition,
} from "../../engines/progression";

describe("resolveStreakTransition", () => {
  const base = {
    currentStreak: 5,
    longestStreak: 7,
    lastActiveDate: "2026-10-06",
    freezesAvailable: 1,
    freezesUsed: 0,
  };

  it("increments on consecutive day", () => {
    const next = resolveStreakTransition("2026-10-07", base);
    assert.equal(next.currentStreak, 6);
    assert.equal(next.freezeConsumed, false);
    assert.equal(next.unchanged, false);
  });

  it("consumes freeze across a 1-day gap", () => {
    const next = resolveStreakTransition("2026-10-08", base);
    assert.equal(next.currentStreak, 6);
    assert.equal(next.freezesAvailable, 0);
    assert.equal(next.freezesUsed, 1);
    assert.equal(next.freezeConsumed, true);
  });

  it("resets when gap is too large", () => {
    const next = resolveStreakTransition("2026-10-10", {
      ...base,
      freezesAvailable: 0,
    });
    assert.equal(next.currentStreak, 1);
    assert.equal(next.freezeConsumed, false);
  });

  it("no-ops on same day", () => {
    const next = resolveStreakTransition("2026-10-06", base);
    assert.equal(next.unchanged, true);
    assert.equal(next.currentStreak, 5);
  });
});

describe("effectiveCurrentStreak", () => {
  it("zeros stale streaks without a freeze bridge", () => {
    assert.equal(
      effectiveCurrentStreak("2026-10-08", "2026-10-06", 5, 0),
      0
    );
    assert.equal(
      effectiveCurrentStreak("2026-10-08", "2026-10-06", 5, 1),
      5
    );
  });
});
