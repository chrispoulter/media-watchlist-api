import { Router } from "express";
import { z } from "zod";
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

  return res.json({
    results: data.results.map((item) => ({
      tmdbId: item.id,
      mediaType: item.media_type,
      title: item.title ?? undefined,
      posterPath: item.poster_path ?? undefined,
      overview: item.overview ?? undefined,
      releaseDate: item.release_date ?? undefined,
    })),
  });
});

export default router;
