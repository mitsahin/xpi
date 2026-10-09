import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./lib/env";
import { prisma } from "./lib/prisma";
import { asyncHandler } from "./lib/asyncHandler";
import { isAppError } from "./lib/errors";
import { authRouter } from "./routes/auth";
import { lessonsRouter } from "./routes/lessons";
import { meRouter } from "./routes/me";

const app = express();

// Rate-limit + reverse-proxy friendly IP
app.set("trust proxy", 1);

app.use(
  helmet({
    // API-only; no CSP needed for JSON responses
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: env.jsonLimit }));

// Process liveness — no DB (safe for orchestrator restart probes)
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "walky-talky-api" });
});

// Readiness — Postgres reachable
app.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: "walky-talky-api", ready: true });
  })
);
app.use("/auth", authRouter);
app.use("/lessons", lessonsRouter);
app.use("/me", meRouter);

app.use(
  (
    err: Error & { status?: number; code?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (isAppError(err) || typeof err.status === "number") {
      const status = err.status || 400;
      return res.status(status).json({
        error: err.message || "Request failed",
        code: err.code,
      });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error", code: "INTERNAL" });
  }
);

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Walky Talky API listening on http://0.0.0.0:${env.port}`);
});
