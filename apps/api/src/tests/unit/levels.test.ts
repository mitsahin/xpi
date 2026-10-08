import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { levelFromXp, xpForLevel, xpProgressInLevel } from "@x-pi/shared";

describe("XP / levels", () => {
  it("maps XP to levels monotonically", () => {
    assert.equal(levelFromXp(0), 1);
    assert.equal(xpForLevel(1), 0);
    assert.ok(xpForLevel(3) > xpForLevel(2));
    assert.equal(levelFromXp(xpForLevel(5)), 5);
  });

  it("reports progress inside a level", () => {
    const floor = xpForLevel(2);
    const next = xpForLevel(3);
    const mid = floor + Math.floor((next - floor) / 2);
    const p = xpProgressInLevel(mid);
    assert.equal(p.level, 2);
    assert.ok(p.progress > 0 && p.progress < 1);
  });
});
