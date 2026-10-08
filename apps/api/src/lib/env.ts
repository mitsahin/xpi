import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "x-pi-dev-secret",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  databaseUrl: process.env.DATABASE_URL || "",
};
