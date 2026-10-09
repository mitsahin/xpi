import dotenv from "dotenv";
import path from "path";
import { parseDurationToMs } from "./duration";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const nodeEnv = process.env.NODE_ENV || "development";
const jwtFromEnv = process.env.JWT_SECRET?.trim();

if (nodeEnv === "production" && !jwtFromEnv) {
  throw new Error(
    "JWT_SECRET must be set in production (fail-closed; refusing to start)."
  );
}

if (
  nodeEnv === "production" &&
  jwtFromEnv &&
  (jwtFromEnv.length < 32 || jwtFromEnv === "change-me-in-production")
) {
  throw new Error(
    "JWT_SECRET in production must be a strong secret (≥32 chars), not the example value."
  );
}

/** Short-lived access JWT (jsonwebtoken expiresIn). Pair with refresh tokens. */
const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || "15m";
const jwtRefreshExpiresIn =
  process.env.JWT_REFRESH_EXPIRES_IN?.trim() || "30d";

const jwtExpiresMs = parseDurationToMs(jwtExpiresIn);
const jwtRefreshMs = parseDurationToMs(jwtRefreshExpiresIn, 30 * 86_400_000);

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  jwtSecret: jwtFromEnv || "walky-talky-dev-secret",
  jwtExpiresIn,
  jwtExpiresSeconds: Math.max(1, Math.floor(jwtExpiresMs / 1000)),
  jwtRefreshExpiresIn,
  jwtRefreshMs,
  corsOrigin: (
    process.env.CORS_ORIGIN ||
    "http://localhost:5173,http://localhost:5174"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || "",
  /** Max JSON body size for express.json */
  jsonLimit: process.env.JSON_BODY_LIMIT || "32kb",
  /**
   * When true, refresh/login responses may Set-Cookie `walky-talky:refresh`
   * (httpOnly, Secure in production, SameSite=Lax). SPA still receives body tokens.
   */
  authSetCookie: process.env.AUTH_SET_COOKIE === "true",
};
