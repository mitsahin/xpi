import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertOwner } from "../../middleware/auth";
import { AppError, isAppError } from "../../lib/errors";

describe("assertOwner", () => {
  it("allows matching user ids", () => {
    assert.doesNotThrow(() => assertOwner("user-a", "user-a", "Session"));
  });

  it("hides foreign resources as 404 NOT_FOUND", () => {
    try {
      assertOwner("owner-1", "attacker-2", "Session");
      assert.fail("expected throw");
    } catch (e) {
      assert.equal(isAppError(e), true);
      const err = e as AppError;
      assert.equal(err.status, 404);
      assert.equal(err.code, "NOT_FOUND");
      assert.match(err.message, /Session not found/);
    }
  });
});
