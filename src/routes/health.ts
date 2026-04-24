import { Router } from "express";
import { version } from "../env.js";
import { healthCheck as checkDatabase } from "../db/index.js";
import { healthCheck as checkTmdb } from "../lib/tmdb.js";
import { healthCheck as checkSmtp } from "../lib/mailer.js";

const router = Router();

router.get("/", async (_req, res) => {
  const [dbResult, tmdbResult, smtpResult] = await Promise.all([
    checkDatabase(),
    checkTmdb(),
    checkSmtp(),
  ]);

  const services = {
    db: dbResult,
    tmdb: tmdbResult,
    smtp: smtpResult,
  };

  const failing = Object.values(services).some((s) => s?.status !== "ok");

  res.status(failing ? 503 : 200).json({
    status: failing ? "unhealthy" : "ok",
    version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services,
  });
});

export default router;
