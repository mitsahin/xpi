import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDurationToMs } from "../../lib/duration";

describe("parseDurationToMs", () => {
  it("parses seconds minutes hours days", () => {
    assert.equal(parseDurationToMs("15m"), 15 * 60_000);
    assert.equal(parseDurationToMs("7d"), 7 * 86_400_000);
    assert.equal(parseDurationToMs("2h"), 2 * 3_600_000);
    assert.equal(parseDurationToMs("30s"), 30_000);
  });

  it("parses bare seconds and falls back", () => {
    assert.equal(parseDurationToMs("90"), 90_000);
    assert.equal(parseDurationToMs("nope", 1234), 1234);
  });
});
