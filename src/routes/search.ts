import { Router } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { watchlistItem } from "../db/schema.js";
import { requireAuth } from "../middleware/require-auth.js";
import { searchMulti } from "../lib/tmdb.js";

const router = Router();

router.use(requireAuth);

const searchSchema = z.object({
  query: z.string().min(1),
});

router.get("/", async (req, res) => {
  const result = searchSchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({ error: "Invalid request body", details: result.error.issues });
    return;
  }

  const data = await searchMulti(result.data.query);

  const tmdbIds = data.results.map((item) => item.id);

  const watchlistItems = await db
    .select()
    .from(watchlistItem)
    .where(and(eq(watchlistItem.userId, req.user!.id), inArray(watchlistItem.tmdbId, tmdbIds)));

  const watchlistMap = new Map(watchlistItems.map((w) => [`${w.tmdbId}-${w.mediaType}`, w.id]));

  res.json(
    data.results.map((item) => ({
      tmdbId: item.id,
      mediaType: item.media_type,
      title: item.title ?? item.name,
      posterPath: item.poster_path ?? undefined,
      overview: item.overview ?? undefined,
      releaseDate: item.release_date ?? item.first_air_date ?? undefined,
      watchlistItemId: watchlistMap.get(`${item.id}-${item.media_type}`) ?? undefined,
    }))
  );
});

export default router;
