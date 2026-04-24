import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { mailer } from "../lib/mailer.js";
import { env, version } from "../env.js";

const router = Router();

const TMDB_API_URL = "https://api.themoviedb.org/3";
const CHECK_TIMEOUT_MS = 5_000;

interface ServiceResult {
  status: "ok" | "error";
  latencyMs: number;
  error?: string;
}

async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function checkDatabase(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    await withTimeout(() => db.execute(sql`SELECT 1`));
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkTmdb(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    const response = await withTimeout((signal) =>
      fetch(`${TMDB_API_URL}/configuration`, {
        headers: { Authorization: `Bearer ${env.TMDB_API_READ_TOKEN}` },
        signal,
      })
    );
    if (!response.ok) {
      return {
        status: "error",
        latencyMs: Date.now() - start,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkSmtp(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    await withTimeout(() => mailer.verify());
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

router.get("/", async (_req, res) => {
  const [dbResult, tmdbResult, smtpResult] = await Promise.allSettled([
    checkDatabase(),
    checkTmdb(),
    checkSmtp(),
  ]);

  const services = {
    database:
      dbResult.status === "fulfilled"
        ? dbResult.value
        : { status: "error" as const, latencyMs: 0, error: "Check failed" },
    tmdb:
      tmdbResult.status === "fulfilled"
        ? tmdbResult.value
        : { status: "error" as const, latencyMs: 0, error: "Check failed" },
    smtp:
      smtpResult.status === "fulfilled"
        ? smtpResult.value
        : { status: "error" as const, latencyMs: 0, error: "Check failed" },
  };

  const criticalFailing = services.database.status === "error" || services.tmdb.status === "error";
  const anyFailing = Object.values(services).some((s) => s.status === "error");

  const overallStatus = criticalFailing ? "unhealthy" : anyFailing ? "degraded" : "ok";

  res.status(overallStatus === "unhealthy" ? 503 : 200).json({
    status: overallStatus,
    version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services,
  });
});

export default router;
