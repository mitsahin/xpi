import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  newSm2Card,
  qualityFromAnswer,
  scheduleSm2,
} from "@walky-talky/shared";

describe("SM-2 schedule", () => {
  it("maps answer quality from speed", () => {
    assert.equal(qualityFromAnswer(false), 1);
    assert.equal(qualityFromAnswer(true, 1000), 5);
    assert.equal(qualityFromAnswer(true, 4000), 4);
    assert.equal(qualityFromAnswer(true, 9000), 3);
  });

  it("schedules first success into learning", () => {
    const card = newSm2Card();
    const result = scheduleSm2(card, 4, new Date("2026-10-08T12:00:00Z"));
    assert.equal(result.repetitions, 1);
    assert.equal(result.intervalDays, 1);
    assert.equal(result.state, "LEARNING");
    assert.ok(result.dueAt > new Date("2026-10-08T12:00:00Z"));
  });

  it("resets interval on failure but keeps ease floor", () => {
    const card = {
      easeFactor: 2.5,
      intervalDays: 10,
      repetitions: 3,
      lapses: 0,
      state: "REVIEW" as const,
    };
    const result = scheduleSm2(card, 1);
    assert.equal(result.repetitions, 0);
    assert.equal(result.intervalDays, 1);
    assert.equal(result.state, "RELEARNING");
    assert.ok(result.easeFactor >= 1.3);
  });
});
