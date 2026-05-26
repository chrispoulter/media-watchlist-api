import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { version } from '../lib/config.js';
import { check as checkDatabase } from '../db/index.js';
import { check as checkMailer } from '../lib/mailer.js';
import { check as checkTmdb } from '../lib/tmdb.js';
const HealthCheckSchema = z
    .object({
        status: z.enum(['ok', 'unhealthy']),
        version: z.string().openapi({ example: '1.0.0' }),
        uptime: z
            .number()
            .openapi({ description: 'Process uptime in seconds' }),
        services: z.array(
            z.object({
                name: z.string(),
                status: z.enum(['ok', 'unhealthy']),
            })
        ),
    })
    .openapi('HealthCheck');

const AliveCheckSchema = z
    .object({
        status: z.enum(['ok']),
        version: z.string().openapi({ example: '1.0.0' }),
        uptime: z
            .number()
            .openapi({ description: 'Process uptime in seconds' }),
    })
    .openapi('AliveCheck');

const healthRoutes = new OpenAPIHono();

const healthRoute = createRoute({
    method: 'get',
    path: '/health',
    tags: ['Health'],
    summary: 'Health check',
    responses: {
        200: {
            content: { 'application/json': { schema: HealthCheckSchema } },
            description: 'All services are healthy.',
        },
        503: {
            content: { 'application/json': { schema: HealthCheckSchema } },
            description: 'One or more services are unhealthy.',
        },
    },
});

healthRoutes.openapi(healthRoute, async (c) => {
    const services = await Promise.all([
        checkDatabase(),
        checkMailer(),
        checkTmdb(),
    ]);

    const failing = services.some((s) => s.status !== 'ok');

    return c.json(
        {
            status: failing ? ('unhealthy' as const) : ('ok' as const),
            version,
            uptime: process.uptime(),
            services,
        },
        failing ? 503 : 200
    );
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
            content: { 'application/json': { schema: AliveCheckSchema } },
            description: 'Service is alive.',
        },
    },
});

healthRoutes.openapi(aliveRoute, (c) => {
    return c.json({
        status: 'ok' as const,
        version,
        uptime: process.uptime(),
    });
});

export default healthRoutes;
