import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../../plugins/app/authorization.js';
import { db } from '../../../db/index.js';
import { watchlistItem } from '../../../db/schema.js';

const WATCHLIST_ITEM_LIMIT = 100;

const watchlistItemSchema = z.object({
    id: z.number().int(),
    providerId: z.string(),
    mediaType: z.enum(['movie', 'tv-show']),
    title: z.string(),
    posterUrl: z.url().optional(),
    overview: z.string().optional(),
    releaseDate: z.string().optional(),
    addedAt: z.string(),
});

const addWatchlistItemSchema = z.object({
    providerId: z.string().min(1),
    mediaType: z.enum(['movie', 'tv-show']),
    title: z.string().min(1),
    posterUrl: z.url().optional(),
    overview: z.string().optional(),
    releaseDate: z.string().optional(),
});

const errorSchema = z.object({
    error: z.string(),
    message: z.string().optional(),
    statusCode: z.number().optional(),
    details: z
        .object({
            issues: z.array(z.any()),
            method: z.string(),
            url: z.string(),
        })
        .optional(),
});

const plugin: FastifyPluginAsyncZod = async (fastify) => {
    fastify.addHook('preHandler', requireAuth);

    fastify.get(
        '/',
        {
            schema: {
                tags: ['Watchlist'],
                summary: 'Get all watchlist items for the current user',
                security: [{ bearerAuth: [] }],
                response: {
                    200: z.array(watchlistItemSchema),
                    401: errorSchema,
                },
            },
        },
        async (request) => {
            const data = await db
                .select()
                .from(watchlistItem)
                .where(eq(watchlistItem.userId, request.user!.id));

            return data.map((item) => ({
                id: item.id,
                providerId: item.providerId,
                mediaType: item.mediaType,
                title: item.title,
                posterUrl: item.posterUrl ?? undefined,
                overview: item.overview ?? undefined,
                releaseDate: item.releaseDate ?? undefined,
                addedAt: item.addedAt.toISOString(),
            }));
        }
    );

    fastify.post(
        '/',
        {
            schema: {
                tags: ['Watchlist'],
                summary: 'Add an item to the watchlist',
                security: [{ bearerAuth: [] }],
                body: addWatchlistItemSchema,
                response: {
                    201: watchlistItemSchema,
                    400: errorSchema,
                    401: errorSchema,
                    409: errorSchema,
                    429: errorSchema,
                    500: errorSchema,
                },
            },
        },
        async (request, reply) => {
            const userId = request.user!.id;

            const count = await db.$count(
                watchlistItem,
                eq(watchlistItem.userId, userId)
            );

            if (count >= WATCHLIST_ITEM_LIMIT) {
                return reply.code(429).send({
                    error: `Watchlist limit of ${WATCHLIST_ITEM_LIMIT} items reached`,
                });
            }

            try {
                const [created] = await db
                    .insert(watchlistItem)
                    .values({ ...request.body, userId })
                    .returning();

                if (!created) {
                    return reply
                        .code(500)
                        .send({ error: 'Failed to add item to watchlist' });
                }

                request.log.info(
                    {
                        itemId: created.id,
                        providerId: created.providerId,
                        mediaType: created.mediaType,
                        title: created.title,
                    },
                    'Watchlist item added'
                );

                return reply.code(201).send({
                    id: created.id,
                    providerId: created.providerId,
                    mediaType: created.mediaType,
                    title: created.title,
                    posterUrl: created.posterUrl ?? undefined,
                    overview: created.overview ?? undefined,
                    releaseDate: created.releaseDate ?? undefined,
                    addedAt: created.addedAt.toISOString(),
                });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : '';

                if (message.includes('watchlist_user_provider_idx')) {
                    request.log.warn(
                        {
                            providerId: request.body.providerId,
                            mediaType: request.body.mediaType,
                        },
                        'Duplicate watchlist item'
                    );
                    return reply
                        .code(409)
                        .send({ error: 'Item already exists in watchlist' });
                }

                throw err;
            }
        }
    );

    fastify.delete(
        '/:id',
        {
            schema: {
                tags: ['Watchlist'],
                summary: 'Remove an item from the watchlist',
                security: [{ bearerAuth: [] }],
                params: z.object({
                    id: z.coerce.number().int().positive(),
                }),
                response: {
                    204: z.null(),
                    400: errorSchema,
                    401: errorSchema,
                    404: errorSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user!.id;

            const [deleted] = await db
                .delete(watchlistItem)
                .where(
                    and(
                        eq(watchlistItem.id, id),
                        eq(watchlistItem.userId, userId)
                    )
                )
                .returning();

            if (!deleted) {
                request.log.warn({ itemId: id }, 'Watchlist item not found');
                return reply
                    .code(404)
                    .send({ error: 'Item not found in watchlist' });
            }

            request.log.info({ itemId: deleted.id }, 'Watchlist item removed');
            return reply.code(204).send(null);
        }
    );
};

export default plugin;
