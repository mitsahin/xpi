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

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  jwtSecret: jwtFromEnv || "x-pi-dev-secret",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  databaseUrl: process.env.DATABASE_URL || "",
};
