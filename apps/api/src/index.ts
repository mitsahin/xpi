import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import { authRouter } from "./routes/auth";
import { lessonsRouter } from "./routes/lessons";
import { meRouter } from "./routes/me";

const app = express();
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "x-pi-api" }));
app.use("/auth", authRouter);
app.use("/lessons", lessonsRouter);
app.use("/me", meRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(env.port, "0.0.0.0", () => {
  console.log(`x-pi API listening on http://0.0.0.0:${env.port}`);
});
