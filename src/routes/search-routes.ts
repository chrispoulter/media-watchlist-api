import { Hono } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { watchlistItem } from '../db/schema.js';
import { requireAuth } from '../middleware/require-auth.js';
import { search } from '../lib/tmdb.js';
import type { AppEnv } from '../types/hono.js';

const searchRoutes = new Hono<AppEnv>();

searchRoutes.use('*', requireAuth);

const searchSchema = z.object({
    query: z.string().min(1),
});

searchRoutes.get('/search', async (c) => {
    const result = searchSchema.safeParse({ query: c.req.query('query') });

    if (!result.success) {
        return c.json(
            { error: 'Invalid request query', details: result.error.issues },
            400
        );
    }

    const data = await search(result.data.query);

    const providerIds = data.map((item) => item.providerId);

    const watchlistItems = await db
        .select()
        .from(watchlistItem)
        .where(
            and(
                eq(watchlistItem.userId, c.get('user').id),
                inArray(watchlistItem.providerId, providerIds)
            )
        );

    const watchlistMap = new Map(
        watchlistItems.map((w) => [`${w.providerId}-${w.mediaType}`, w.id])
    );

    return c.json(
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

export default searchRoutes;
