import { createRoute, z } from '@hono/zod-openapi';
import { createRouter } from '../lib/create-router.js';
import { version } from '../lib/config.js';

import { check as checkDatabase } from '../db/index.js';
import { check as checkMailer } from '../lib/mailer.js';
import { check as checkTmdb } from '../lib/tmdb.js';

const router = createRouter();

const healthResponseSchema = z.object({
    status: z.enum(['ok', 'unhealthy']),
    version: z.string().openapi({ example: '1.0.0' }),
    uptime: z.number(),
    services: z.array(
        z.object({
            name: z.string(),
            status: z.enum(['ok', 'unhealthy']),
        })
    ),
});

const healthRoute = createRoute({
    method: 'get',
    path: '/health',
    tags: ['Health'],
    summary: 'Health check',
    responses: {
        200: {
            description: 'All services are healthy.',
            content: { 'application/json': { schema: healthResponseSchema } },
        },
        503: {
            description: 'One or more services are unhealthy.',
            content: { 'application/json': { schema: healthResponseSchema } },
        },
    },
});

router.openapi(healthRoute, async (c) => {
    const services = await Promise.all([
        checkDatabase(),
        checkMailer(),
        checkTmdb(),
    ]);

    const failing = services.some((s) => s.status !== 'ok');

    return c.json(
        {
            status: failing ? 'unhealthy' : 'ok',
            version,
            uptime: process.uptime(),
            services,
        },
        failing ? 503 : 200
    );
});

const aliveResponseSchema = z.object({
    status: z.literal('ok'),
    version: z.string().openapi({ example: '1.0.0' }),
    uptime: z.number(),
});

const aliveRoute = createRoute({
    method: 'get',
    path: '/alive',
    tags: ['Health'],
    summary: 'Liveness probe',
    description:
        'Lightweight liveness check — always returns 200 without checking downstream services.',
    responses: {
        200: {
            description: 'Service is alive.',
            content: { 'application/json': { schema: aliveResponseSchema } },
        },
    },
});

router.openapi(aliveRoute, (c) => {
    return c.json(
        {
            status: 'ok' as const,
            version,
            uptime: process.uptime(),
        },
        200
    );
});

export default router;
