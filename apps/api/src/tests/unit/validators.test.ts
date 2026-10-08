import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  answerBodySchema,
  idSchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "../../validators";

describe("validators", () => {
  it("accepts cuid-like ids and rejects junk", () => {
    assert.equal(idSchema.safeParse("clxyz0123456789").success, true);
    assert.equal(idSchema.safeParse("bad id!").success, false);
    assert.equal(idSchema.safeParse("short").success, false);
  });

  it("validates register / login bodies", () => {
    assert.equal(
      registerBodySchema.safeParse({
        email: "a@b.co",
        password: "secret1",
        displayName: "Ada",
      }).success,
      true
    );
    assert.equal(
      registerBodySchema.safeParse({
        email: "nope",
        password: "x",
        displayName: "",
      }).success,
      false
    );
    assert.equal(
      loginBodySchema.safeParse({ email: "a@b.co", password: "x" }).success,
      true
    );
  });

  it("bounds answer payloads and refresh tokens", () => {
    assert.equal(
      answerBodySchema.safeParse({
        questionId: "clquestion12345",
        answer: "hola",
        responseMs: 1200,
      }).success,
      true
    );
    assert.equal(
      answerBodySchema.safeParse({
        questionId: "clquestion12345",
        answer: "x".repeat(600),
      }).success,
      false
    );
    assert.equal(
      refreshBodySchema.safeParse({
        refreshToken: "a".repeat(40),
      }).success,
      true
    );
    assert.equal(refreshBodySchema.safeParse({}).success, true);
  });
});
