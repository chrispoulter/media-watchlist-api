import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { healthCheck as checkDatabase } from '../../../db/index.js';
import { healthCheck as checkTmdb } from '../../../lib/tmdb.js';
import { healthCheck as checkMailer } from '../../../lib/mailer.js';
import { environment, version } from '../../../lib/config.js';

const plugin: FastifyPluginAsyncZod = async (fastify) => {
    fastify.get(
        '/',
        {
            config: { disableRequestLogging: true },
            schema: {
                tags: ['Health'],
                summary: 'Health check',
                response: {
                    200: z.object({
                        status: z.literal('ok'),
                        version: z.string(),
                        environment: z.string(),
                        uptime: z.number(),
                        services: z.array(
                            z.object({
                                service: z.string(),
                                success: z.boolean(),
                            })
                        ),
                    }),
                    503: z.object({
                        status: z.literal('unhealthy'),
                        version: z.string(),
                        environment: z.string(),
                        uptime: z.number(),
                        services: z.array(
                            z.object({
                                service: z.string(),
                                success: z.boolean(),
                            })
                        ),
                    }),
                },
            },
        },
        async (_request, reply) => {
            const services = await Promise.all([
                checkDatabase(),
                checkTmdb(),
                checkMailer(),
            ]);

            const failing = services.some((s) => s?.success !== true);

            return reply.code(failing ? 503 : 200).send({
                status: failing ? 'unhealthy' : 'ok',
                version,
                environment,
                uptime: process.uptime(),
                services,
            });
        }
    );
};

export default plugin;
