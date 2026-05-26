import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { watchlistItem } from '../db/schema.js';
import { requireAuth } from '../middleware/require-auth.js';
import type { AppEnv } from '../types/hono.js';

const WATCHLIST_ITEM_LIMIT = 100;

const watchlistRoutes = new Hono<AppEnv>();

watchlistRoutes.use('*', requireAuth);

watchlistRoutes.get('/watchlist', async (c) => {
    const data = await db
        .select()
        .from(watchlistItem)
        .where(eq(watchlistItem.userId, c.get('user').id));

    return c.json(
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
    mediaType: z.enum(['movie', 'tv-show']),
    title: z.string().min(1),
    posterUrl: z.url().optional(),
    overview: z.string().optional(),
    releaseDate: z.string().optional(),
});

watchlistRoutes.post(
    '/watchlist',
    zValidator('json', addWatchlistItemSchema),
    async (c) => {
        const body = c.req.valid('json');
        const userId = c.get('user').id;

        const count = await db.$count(
            watchlistItem,
            eq(watchlistItem.userId, userId)
        );

        if (count >= WATCHLIST_ITEM_LIMIT) {
            return c.json(
                {
                    error: `Watchlist limit of ${WATCHLIST_ITEM_LIMIT} items reached`,
                },
                429
            );
        }

        try {
            const [created] = await db
                .insert(watchlistItem)
                .values({ ...body, userId })
                .returning();

            if (!created) {
                return c.json(
                    { error: 'Failed to add item to watchlist' },
                    500
                );
            }

            c.get('logger').info(
                {
                    itemId: created.id,
                    providerId: created.providerId,
                    mediaType: created.mediaType,
                    title: created.title,
                },
                'Watchlist item added'
            );

            return c.json(
                {
                    id: created.id,
                    providerId: created.providerId,
                    mediaType: created.mediaType,
                    title: created.title,
                    posterUrl: created.posterUrl ?? undefined,
                    overview: created.overview ?? undefined,
                    releaseDate: created.releaseDate ?? undefined,
                    addedAt: created.addedAt,
                },
                201
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';

            if (message.includes('watchlist_user_provider_idx')) {
                c.get('logger').warn(
                    {
                        providerId: body.providerId,
                        mediaType: body.mediaType,
                    },
                    'Duplicate watchlist item'
                );

                return c.json(
                    { error: 'Item already exists in watchlist' },
                    409
                );
            }

            throw err;
        }
    }
);

const deleteWatchlistItemSchema = z.object({
    id: z.coerce.number().int().positive(),
});

watchlistRoutes.delete(
    '/watchlist/:id',
    zValidator('param', deleteWatchlistItemSchema),
    async (c) => {
        const { id } = c.req.valid('param');
        const userId = c.get('user').id;

        const [deleted] = await db
            .delete(watchlistItem)
            .where(
                and(eq(watchlistItem.id, id), eq(watchlistItem.userId, userId))
            )
            .returning();

        if (!deleted) {
            c.get('logger').warn({ itemId: id }, 'Watchlist item not found');
            return c.json({ error: 'Item not found in watchlist' }, 404);
        }

        c.get('logger').info({ itemId: deleted.id }, 'Watchlist item removed');

        return c.body(null, 204);
    }
);

export default watchlistRoutes;
