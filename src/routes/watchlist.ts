import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { watchlistItem } from "../db/schema.js";
import { requireAuth } from "../middleware/require-auth.js";

const WATCHLIST_ITEM_LIMIT = 100;

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const data = await db.select().from(watchlistItem).where(eq(watchlistItem.userId, req.user!.id));

  res.json(
    data.map((item) => ({
      id: item.id,
      providerId: item.providerId,
      mediaType: item.mediaType,
      title: item.title,
      posterUrl: item.posterUrl ?? undefined,
      overview: item.overview ?? undefined,
      releaseDate: item.releaseDate ?? undefined,
      addedAt: item.addedAt,
    }))
  );
});

const addWatchlistItemSchema = z.object({
  providerId: z.string().min(1),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  posterUrl: z.string().optional(),
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

  const count = await db.$count(watchlistItem, eq(watchlistItem.userId, userId));

  if (count >= WATCHLIST_ITEM_LIMIT) {
    res.status(429).json({ error: `Watchlist limit of ${WATCHLIST_ITEM_LIMIT} items reached` });
    return;
  }

  try {
    const [created] = await db
      .insert(watchlistItem)
      .values({ ...result.data, userId })
      .returning();

    if (!created) {
      res.status(500).json({ error: "Failed to add item to watchlist" });
      return;
    }

    res.status(201).json({
      id: created.id,
      providerId: created.providerId,
      mediaType: created.mediaType,
      title: created.title,
      posterUrl: created.posterUrl ?? undefined,
      overview: created.overview ?? undefined,
      releaseDate: created.releaseDate ?? undefined,
      addedAt: created.addedAt,
    });

    req.log.info(
      {
        itemId: created.id,
        providerId: created.providerId,
        mediaType: created.mediaType,
        title: created.title,
      },
      "Watchlist item added"
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";

    if (message.includes("watchlist_user_provider_idx")) {
      req.log.warn(
        { providerId: result.data.providerId, mediaType: result.data.mediaType },
        "Duplicate watchlist item"
      );
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
    req.log.warn({ itemId: id }, "Watchlist item not found");
    res.status(404).json({ error: "Item not found in watchlist" });
    return;
  }

  req.log.info({ itemId: deleted.id }, "Watchlist item removed");

  res.status(204).send();
});

export default router;
