import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { rateLimit, resetRateLimitBuckets } from "../../middleware/rateLimit";

function mockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: unknown;
  const res = {
    setHeader(k: string, v: string) {
      headers[k] = v;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  };
  return {
    res: res as unknown as Response,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
  };
}

describe("rateLimit", () => {
  beforeEach(() => resetRateLimitBuckets());

  it("allows requests under the max", () => {
    const mw = rateLimit({ windowMs: 60_000, max: 2, key: () => "t" });
    const req = { path: "/auth/login", ip: "1.1.1.1" } as Request;
    let nextCount = 0;
    const a = mockRes();
    mw(req, a.res, () => {
      nextCount += 1;
    });
    const b = mockRes();
    mw(req, b.res, () => {
      nextCount += 1;
    });
    assert.equal(nextCount, 2);
    assert.equal(a.statusCode, 200);
  });

  it("blocks after max with 429", () => {
    const mw = rateLimit({ windowMs: 60_000, max: 1, key: () => "t2" });
    const req = { path: "/auth/login", ip: "2.2.2.2" } as Request;
    mw(req, mockRes().res, () => {});
    const blocked = mockRes();
    let nexted = false;
    mw(req, blocked.res, () => {
      nexted = true;
    });
    assert.equal(nexted, false);
    assert.equal(blocked.statusCode, 429);
  });
});
