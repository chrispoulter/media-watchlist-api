import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { watchlistItem } from '../db/schema.js';
import { requireAuth } from '../middleware/require-auth.js';
import { ErrorSchema } from '../lib/schemas.js';
import type { AppEnv } from '../types/hono.js';

const WATCHLIST_ITEM_LIMIT = 100;

const WatchlistItemSchema = z
    .object({
        id: z.number().int(),
        providerId: z.string(),
        mediaType: z.enum(['movie', 'tv-show']),
        title: z.string(),
        posterUrl: z.string().nullable().optional(),
        overview: z.string().nullable().optional(),
        releaseDate: z.string().nullable().optional(),
        addedAt: z.string().datetime(),
    })
    .openapi('WatchlistItem');

const AddWatchlistItemRequestSchema = z
    .object({
        providerId: z.string().min(1).openapi({ example: 'tmdb:1396' }),
        mediaType: z.enum(['movie', 'tv-show']).openapi({ example: 'tv-show' }),
        title: z.string().min(1).openapi({ example: 'Breaking Bad' }),
        posterUrl: z.string().url().optional().openapi({
            example:
                'https://image.tmdb.org/t/p/w300/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
        }),
        overview: z
            .string()
            .optional()
            .openapi({ example: 'A high school chemistry teacher...' }),
        releaseDate: z.string().optional().openapi({ example: '2008-01-20' }),
    })
    .openapi('AddWatchlistItemRequest');

const watchlistRoutes = new OpenAPIHono<AppEnv>();

const getWatchlistRoute = createRoute({
    method: 'get',
    path: '/watchlist',
    tags: ['Watchlist'],
    summary: 'Get all watchlist items for the current user',
    security: [{ bearerAuth: [] }],
    middleware: [requireAuth] as const,
    responses: {
        200: {
            content: {
                'application/json': { schema: z.array(WatchlistItemSchema) },
            },
            description: 'List of watchlist items.',
        },
        401: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Unauthorized.',
        },
        500: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Internal Server Error.',
        },
    },
});

watchlistRoutes.openapi(getWatchlistRoute, async (c) => {
    const user = c.get('user');

    const data = await db
        .select()
        .from(watchlistItem)
        .where(eq(watchlistItem.userId, user.id));

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

const addWatchlistItemRoute = createRoute({
    method: 'post',
    path: '/watchlist',
    tags: ['Watchlist'],
    summary: 'Add an item to the watchlist',
    security: [{ bearerAuth: [] }],
    middleware: [requireAuth] as const,
    request: {
        body: {
            required: true,
            content: {
                'application/json': { schema: AddWatchlistItemRequestSchema },
            },
        },
    },
    responses: {
        201: {
            content: { 'application/json': { schema: WatchlistItemSchema } },
            description: 'Item added to watchlist.',
        },
        400: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Invalid request body.',
        },
        401: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Unauthorized.',
        },
        409: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Item already exists in watchlist.',
        },
        429: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Watchlist limit of items reached.',
        },
        500: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Internal Server Error.',
        },
    },
});

watchlistRoutes.openapi(addWatchlistItemRoute, async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user');
    const log = c.get('logger');

    const count = await db.$count(
        watchlistItem,
        eq(watchlistItem.userId, user.id)
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
            return c.json({ error: 'Failed to add item to watchlist' }, 500);
        }

        log.info(
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
                addedAt: created.addedAt.toISOString(),
            },
            201
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '';

        if (message.includes('watchlist_user_provider_idx')) {
            log.warn(
                {
                    providerId: body.providerId,
                    mediaType: body.mediaType,
                },
                'Duplicate watchlist item'
            );

            return c.json({ error: 'Item already exists in watchlist' }, 409);
        }

        throw err;
    }
});

const deleteWatchlistItemParamsSchema = z.object({
    id: z.coerce.number().int().positive().openapi({ example: 42 }),
});

const deleteWatchlistItemRoute = createRoute({
    method: 'delete',
    path: '/watchlist/{id}',
    tags: ['Watchlist'],
    summary: 'Remove an item from the watchlist',
    security: [{ bearerAuth: [] }],
    middleware: [requireAuth] as const,
    request: {
        params: deleteWatchlistItemParamsSchema,
    },
    responses: {
        204: {
            description: 'Item removed.',
        },
        400: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Invalid request parameters.',
        },
        401: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Unauthorized.',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Item not found in watchlist.',
        },
        500: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Internal Server Error.',
        },
    },
});

watchlistRoutes.openapi(deleteWatchlistItemRoute, async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const log = c.get('logger');

    const [deleted] = await db
        .delete(watchlistItem)
        .where(and(eq(watchlistItem.id, id), eq(watchlistItem.userId, user.id)))
        .returning();

    if (!deleted) {
        log.warn({ itemId: id }, 'Watchlist item not found');
        return c.json({ error: 'Item not found in watchlist' }, 404);
    }

    log.info({ itemId: deleted.id }, 'Watchlist item removed');

    return c.body(null, 204);
});

export default watchlistRoutes;
