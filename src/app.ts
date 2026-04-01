import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { rateLimit } from "express-rate-limit";
import { apiReference } from "@scalar/express-api-reference";
import { auth } from "./lib/auth.js";
import { env } from "./env.js";
import apiRouter from "./routes/index.js";
import { openApiSpec } from "./openapi.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(","),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  app.use(
    rateLimit({
      max: 100,
      windowMs: 60 * 1000,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use("/api", apiRouter);

  app.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    "/",
    apiReference({
      url: "/openapi.json",
      pageTitle: "Media Watchlist API",
    })
  );

  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: "Internal Server Error" });
    }
  );

  return app;
}
