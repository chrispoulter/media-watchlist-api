import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { subscribe, unsubscribe } from "../lib/sse.js";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(`data: Connected\n\n`);

  const channel = `user:${req.user!.id}`;
  subscribe(channel, res);

  req.on("close", () => {
    unsubscribe(channel, res);
    res.end();
  });
});

export default router;
