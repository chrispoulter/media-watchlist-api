import { Router } from "express";
import healthRouter from "./health.js";
import searchRouter from "./search.js";
import watchlistRouter from "./watchlist.js";
import eventsRouter from "./events.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/search", searchRouter);
router.use("/watchlist", watchlistRouter);
router.use("/events", eventsRouter);

export default router;
