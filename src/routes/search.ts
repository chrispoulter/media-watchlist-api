import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { watchlistItem } from "../db/schema.js";
import { requireAuth } from "../middleware/require-auth.js";
import { searchMulti } from "../lib/tmdb.js";

const router = Router();

router.use(requireAuth);

const searchSchema = z.object({
  q: z.string().min(1),
});

router.get("/", async (req, res) => {
  const result = searchSchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({ error: "Invalid request body", details: result.error.issues });
    return;
  }

  const data = await searchMulti(result.data.q);

  const watchlistItems = await db
    .select()
    .from(watchlistItem)
    .where(eq(watchlistItem.userId, req.user!.id));

  res.json(
    data.results.map((item) => {
      const watchlistItemId = watchlistItems.find(
        (w) => w.tmdbId === item.id && w.mediaType === item.media_type
      )?.id;

      return {
        tmdbId: item.id,
        mediaType: item.media_type,
        title: item.title ?? item.name,
        posterPath: item.poster_path ?? undefined,
        overview: item.overview ?? undefined,
        releaseDate: item.release_date ?? undefined,
        watchlistItemId: watchlistItemId ?? undefined,
      };
    })
  );
});

export default router;
