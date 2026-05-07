import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import type { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import { requireAuth } from '../../../plugins/app/authorization.js';
import { db } from '../../../db/index.js';
import { watchlistItem } from '../../../db/schema.js';
import { search } from '../../../lib/tmdb.js';

const searchResultSchema = z.object({
    providerId: z.string(),
    mediaType: z.enum(['movie', 'tv-show']),
    title: z.string(),
    posterUrl: z.string().optional(),
    overview: z.string().optional(),
    releaseDate: z.string().optional(),
    watchlistItemId: z.number().int().optional(),
});

const errorSchema = z.object({ error: z.string() });

const plugin: FastifyPluginAsyncZod = async (fastify) => {
    fastify.addHook('preHandler', requireAuth);

    fastify.get(
        '/',
        {
            schema: {
                tags: ['Search'],
                summary: 'Search for movies and TV shows',
                security: [{ bearerAuth: [] }],
                querystring: z.object({
                    query: z.string().min(1),
                }),
                response: {
                    200: z.array(searchResultSchema),
                    400: errorSchema,
                    401: errorSchema,
                },
            },
        },
        async (request) => {
            const data = await search(request.query.query);

            const providerIds = data.map((item) => item.providerId);

            const watchlistItems = await db
                .select()
                .from(watchlistItem)
                .where(
                    and(
                        eq(watchlistItem.userId, request.user!.id),
                        inArray(watchlistItem.providerId, providerIds)
                    )
                );

            const watchlistMap = new Map(
                watchlistItems.map((w) => [
                    `${w.providerId}-${w.mediaType}`,
                    w.id,
                ])
            );

            return data.map((item) => ({
                providerId: item.providerId,
                mediaType: item.mediaType,
                title: item.title,
                posterUrl: item.posterUrl ?? undefined,
                overview: item.overview ?? undefined,
                releaseDate: item.releaseDate ?? undefined,
                watchlistItemId:
                    watchlistMap.get(`${item.providerId}-${item.mediaType}`) ??
                    undefined,
            }));
        }
    );
};

export default plugin;
