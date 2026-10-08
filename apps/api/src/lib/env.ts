import dotenv from "dotenv";
import path from "path";

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

/** Access-token lifetime (jsonwebtoken expiresIn). Refresh tokens are planned. */
const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || "7d";

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  jwtSecret: jwtFromEnv || "x-pi-dev-secret",
  jwtExpiresIn,
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
};
