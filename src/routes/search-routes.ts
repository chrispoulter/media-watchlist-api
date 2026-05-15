import { Router } from 'express';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { watchlistItem } from '../db/schema.js';
import { requireAuth } from '../middleware/require-auth.js';
import { search } from '../lib/tmdb.js';

const router = Router();

router.use(requireAuth);

const searchSchema = z.object({
    query: z.string().min(1),
});

router.get('/', async (req, res) => {
    const result = searchSchema.safeParse(req.query);

    if (!result.success) {
        res.status(400).json({
            error: 'Invalid request query',
            details: result.error.issues,
        });
        return;
    }

    const data = await search(result.data.query);

    const providerIds = data.map((item) => item.providerId);

    const watchlistItems = await db
        .select()
        .from(watchlistItem)
        .where(
            and(
                eq(watchlistItem.userId, req.user!.id),
                inArray(watchlistItem.providerId, providerIds)
            )
        );

    const watchlistMap = new Map(
        watchlistItems.map((w) => [`${w.providerId}-${w.mediaType}`, w.id])
    );

    res.json(
        data.map((item) => ({
            providerId: item.providerId,
            mediaType: item.mediaType,
            title: item.title,
            posterUrl: item.posterUrl ?? undefined,
            overview: item.overview ?? undefined,
            releaseDate: item.releaseDate ?? undefined,
            watchlistItemId:
                watchlistMap.get(`${item.providerId}-${item.mediaType}`) ??
                undefined,
        }))
    );
});

export default router;
