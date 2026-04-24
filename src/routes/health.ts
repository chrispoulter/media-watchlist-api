import { Router } from "express";
import { version } from "../env.js";
import { healthCheck as checkDatabase } from "../db/index.js";
import { healthCheck as checkTmdb } from "../lib/tmdb.js";
import { healthCheck as checkSmtp } from "../lib/mailer.js";

const router = Router();

router.get("/", async (_req, res) => {
  const services = await Promise.all([checkDatabase(), checkTmdb(), checkSmtp()]);
  const failing = services.some((s) => s?.success !== true);

  res.status(failing ? 503 : 200).json({
    status: failing ? "unhealthy" : "ok",
    version,
    uptime: process.uptime(),
    services,
  });
});

export default router;
