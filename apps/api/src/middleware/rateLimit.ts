import type { NextFunction, Request, Response } from "express";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Simple in-memory sliding window rate limiter (per-process). */
export function rateLimit(options: {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
}) {
  const { windowMs, max } = options;
  const keyFn =
    options.key ??
    ((req: Request) => {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress ||
        "unknown";
      return `${req.path}:${ip}`;
    });

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req);
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader(
      "X-RateLimit-Reset",
      String(Math.ceil(bucket.resetAt / 1000))
    );
    if (bucket.count > max) {
      return res.status(429).json({
        error: "Too many requests. Please try again shortly.",
      });
    }
    return next();
  };
}

/** Auth endpoints: 20 attempts / 15 minutes per IP. */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

/** Test helper — clear buckets between tests. */
export function resetRateLimitBuckets() {
  buckets.clear();
}
