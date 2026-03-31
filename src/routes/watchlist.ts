import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { watchlistItem } from "../db/schema.js";
import { requireAuth } from "../middleware/require-auth.js";
import { emit } from "../lib/sse.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const items = await db.select().from(watchlistItem).where(eq(watchlistItem.userId, req.user!.id));

  res.json(items);
});

const addWatchlistItemSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  posterPath: z.string().optional(),
  overview: z.string().optional(),
  releaseDate: z.string().optional(),
});

router.post("/", async (req, res) => {
  const result = addWatchlistItemSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: "Invalid request body", details: result.error.issues });
    return;
  }

  const userId = req.user!.id;

  try {
    const [created] = await db
      .insert(watchlistItem)
      .values({ ...result.data, userId })
      .returning();

    if (!created) {
      res.status(500).json({ error: "Failed to add item to watchlist" });
      return;
    }

    const newItem = {
      id: created.id,
      tmdbId: created.tmdbId,
      mediaType: created.mediaType,
      title: created.title,
      posterPath: created.posterPath,
      overview: created.overview,
      releaseDate: created.releaseDate,
    };

    emit(`user:${userId}`, {
      event: "item-added",
      data: newItem,
    });

    res.status(201).json(newItem);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";

    if (message.includes("watchlist_user_tmdb_idx")) {
      res.status(409).json({ error: "Item already exists in watchlist" });
      return;
    }

    throw err;
  }
});

const deleteWatchlistItemSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.delete("/:id", async (req, res) => {
  const result = deleteWatchlistItemSchema.safeParse(req.params);

  if (!result.success) {
    res.status(400).json({ error: "Invalid request parameters", details: result.error.issues });
    return;
  }

  const { id } = result.data;
  const userId = req.user!.id;

  const [deleted] = await db
    .delete(watchlistItem)
    .where(and(eq(watchlistItem.id, id), eq(watchlistItem.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Item not found in watchlist" });
    return;
  }

  emit(`user:${userId}`, {
    event: "item-removed",
    data: { id: deleted.id },
  });

  res.status(204).send();
});

export default router;
