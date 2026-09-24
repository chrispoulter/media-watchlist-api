import { createRoute, z } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import { getLogger } from '@logtape/logtape';
import { db } from '../db/index.js';
import { watchlistItem } from '../db/schema.js';
import { requireAuth } from '../middleware/require-auth.js';
import { errorResponseSchema, mediaTypeSchema } from '../types/index.js';
import { createRouter } from '../lib/create-router.js';

const WATCHLIST_ITEM_LIMIT = 100;

const logger = getLogger(['api', 'watchlist']);

const router = createRouter();

router.use(requireAuth);

const watchlistItemSchema = z.object({
    id: z.number(),
    providerId: z.string(),
    mediaType: mediaTypeSchema,
    title: z.string(),
    posterUrl: z.string().optional(),
    overview: z.string().optional(),
    releaseDate: z.string().optional(),
    addedAt: z.string(),
});

const watchlistResponseSchema = z.array(watchlistItemSchema);

const listRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Watchlist'],
    summary: 'Get all watchlist items for the current user',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of watchlist items.',
            content: {
                'application/json': { schema: watchlistResponseSchema },
            },
        },
        401: {
            description: 'Unauthorized.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        500: {
            description: 'Internal Server Error.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

const addWatchlistItemSchema = z.object({
    providerId: z.string().min(1),
    mediaType: mediaTypeSchema,
    title: z.string().min(1),
    posterUrl: z.url().optional(),
    overview: z.string().optional(),
    releaseDate: z.string().optional(),
});

router.openapi(listRoute, async (c) => {
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
            addedAt: item.addedAt.toISOString(),
        })),
        200
    );
});

const addRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Watchlist'],
    summary: 'Add an item to the watchlist',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            required: true,
            content: { 'application/json': { schema: addWatchlistItemSchema } },
        },
    },
    responses: {
        201: {
            description: 'Item added to watchlist.',
            content: { 'application/json': { schema: watchlistItemSchema } },
        },
        400: {
            description: 'Invalid request body.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        409: {
            description: 'Item already exists in watchlist.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        429: {
            description: 'Watchlist limit of items reached.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        500: {
            description: 'Internal Server Error.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

router.openapi(addRoute, async (c) => {
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
                {
                    error: 'Failed to add item to watchlist',
                },
                500
            );
        }

        logger.info('Watchlist item added {*}', {
            itemId: created.id,
            providerId: created.providerId,
            mediaType: created.mediaType,
            title: created.title,
        });

        return c.json(
            {
                id: created.id,
                providerId: created.providerId,
                mediaType: created.mediaType,
                title: created.title,
                posterUrl: created.posterUrl ?? undefined,
                overview: created.overview ?? undefined,
                releaseDate: created.releaseDate ?? undefined,
                addedAt: created.addedAt.toISOString(),
            },
            201
        );
    } catch (err: unknown) {
        const message =
            err instanceof Error
                ? `${err.message} ${err.cause instanceof Error ? err.cause.message : ''}`
                : '';

        if (message.includes('watchlist_user_provider_idx')) {
            logger.warning('Duplicate watchlist item {*}', {
                providerId: body.providerId,
                mediaType: body.mediaType,
            });

            return c.json(
                {
                    error: 'Item already exists in watchlist',
                },
                409
            );
        }

        throw err;
    }
});

const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['Watchlist'],
    summary: 'Remove an item from the watchlist',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.coerce.number().int().positive(),
        }),
    },
    responses: {
        204: { description: 'Item removed.' },
        400: {
            description: 'Invalid request parameters.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        401: {
            description: 'Unauthorized.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        404: {
            description: 'Item not found in watchlist.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
        500: {
            description: 'Internal Server Error.',
            content: { 'application/json': { schema: errorResponseSchema } },
        },
    },
});

router.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('user').id;

    const [deleted] = await db
        .delete(watchlistItem)
        .where(and(eq(watchlistItem.id, id), eq(watchlistItem.userId, userId)))
        .returning();

    if (!deleted) {
        logger.warning('Watchlist item not found {*}', { itemId: id });
        return c.json({ error: 'Item not found in watchlist' }, 404);
    }

    logger.info('Watchlist item removed {*}', { itemId: deleted.id });

    return c.body(null, 204);
});

export default router;
