import { Router } from "express";
import { version } from "../env.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
