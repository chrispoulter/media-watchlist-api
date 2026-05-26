import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { watchlistItem } from '../db/schema.js';
import { requireAuth } from '../middleware/require-auth.js';
import { search } from '../lib/tmdb.js';
import { errorSchema } from '../lib/schemas.js';
import type { AppEnv } from '../types/hono.js';

const searchRoutes = new OpenAPIHono<AppEnv>();

const searchResultSchema = z
    .object({
        providerId: z.string(),
        mediaType: z.enum(['movie', 'tv-show']),
        title: z.string().optional(),
        posterUrl: z.string().url().nullable().optional(),
        overview: z.string().nullable().optional(),
        releaseDate: z.string().nullable().optional(),
        watchlistItemId: z.number().int().nullable().optional(),
    })
    .openapi('SearchResult');

const searchQuerySchema = z.object({
    query: z.string().min(1).openapi({ example: 'Breaking Bad' }),
});

const searchRoute = createRoute({
    method: 'get',
    path: '/search',
    tags: ['Search'],
    summary: 'Search for movies and TV shows',
    security: [{ bearerAuth: [] }],
    middleware: [requireAuth] as const,
    request: {
        query: searchQuerySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': { schema: z.array(searchResultSchema) },
            },
            description: 'Search results.',
        },
        400: {
            content: { 'application/json': { schema: errorSchema } },
            description: 'Invalid request query.',
        },
        401: {
            content: { 'application/json': { schema: errorSchema } },
            description: 'Unauthorized.',
        },
        500: {
            content: { 'application/json': { schema: errorSchema } },
            description: 'Internal Server Error.',
        },
    },
});

searchRoutes.openapi(searchRoute, async (c) => {
    const { query } = c.req.valid('query');
    const user = c.get('user');

    const data = await search(query);

    const providerIds = data.map((item) => item.providerId);

    const watchlistItems = await db
        .select()
        .from(watchlistItem)
        .where(
            and(
                eq(watchlistItem.userId, user.id),
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
        })),
        200
    );
});

export default searchRoutes;
