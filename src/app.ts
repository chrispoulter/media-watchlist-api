import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { apiReference } from "@scalar/express-api-reference";
import { requestLogger } from "./middleware/request-logger.js";
import { auth } from "./lib/auth.js";
import apiRouter from "./routes/index.js";
import { config } from "./lib/config.js";
import { openApiSpec } from "./openapi.js";

export function createApp() {
  const app = express();

  // app.use(async (_req, _res, next) => {
  //   await new Promise((resolve) => setTimeout(resolve, 1000 * 3));
  //   next();
  // });

  app.use(requestLogger);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: config.CLIENT_ORIGIN.split(","),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  app.use("/api", apiRouter);

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.get("/openapi.json", async (_req, res) => {
    const authSchema = await auth.api.generateOpenAPISchema();

    const authPaths = Object.fromEntries(
      Object.entries(authSchema.paths).map(([path, pathItem]) => [`/api/auth${path}`, pathItem])
    );

    res.json({
      ...openApiSpec,
      paths: { ...authPaths, ...openApiSpec.paths },
      components: {
        ...openApiSpec.components,
        schemas: { ...authSchema.components.schemas, ...openApiSpec.components.schemas },
      },
    });
  });

  app.use(
    "/",
    apiReference({
      url: "/openapi.json",
      pageTitle: "Media Watchlist API",
    })
  );

  app.use((req, res) => {
    req.log.warn({ method: req.method, path: req.path }, "Route not found");
    res.status(404).json({ error: "Not Found" });
  });

  app.use(
    (err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      req.log.error({ err, userId: req.user?.id }, "Unhandled error");
      res.status(500).json({ error: "Internal Server Error" });
    }
  );

  return app;
}
