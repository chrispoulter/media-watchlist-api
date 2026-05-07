import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import {
    serializerCompiler,
    validatorCompiler,
} from '@fastify/type-provider-zod';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { config, version } from './lib/config.js';
import { pinoOptions } from './lib/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import watchlistPlugin from './routes/watchlist-router.js';
import searchPlugin from './routes/search-router.js';
import healthPlugin from './routes/health-router.js';
import docsPlugin from './routes/docs-router.js';

export const buildApp = async () => {
    const fastify = Fastify({
        logger: pinoOptions,
        genReqId: (req) =>
            (req.headers['x-vercel-id'] as string) ?? crypto.randomUUID(),
    });

    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    fastify.decorateRequest('user', null);
    fastify.decorateRequest('session', null);

    await fastify.register(fastifyCors, {
        origin: config.CLIENT_ORIGIN.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    });

    await fastify.register(fastifySwagger, {
        openapi: {
            openapi: '3.0.3',
            info: {
                title: 'Media Watchlist API',
                version,
                description:
                    'REST API for managing a personal media watchlist.',
            },
            servers: [{ url: '/' }],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        description:
                            'Session token returned by sign-in endpoints.',
                    },
                },
            },
            tags: [
                { name: 'Health', description: 'Service health check' },
                {
                    name: 'Search',
                    description: 'Search for movies and TV shows',
                },
                {
                    name: 'Watchlist',
                    description: 'Manage your personal media watchlist',
                },
            ],
        },
    });

    // better-auth: scoped plugin so the catch-all content-type parser
    // doesn't interfere with other routes
    await fastify.register(async (instance) => {
        instance.addContentTypeParser('*', (_req, _payload, done) =>
            done(null)
        );
        instance.all('/api/auth/*', async (request, reply) => {
            await toNodeHandler(auth)(request.raw, reply.raw);
        });
    });

    await fastify.register(healthPlugin, { prefix: '/health' });
    await fastify.register(searchPlugin, { prefix: '/api/search' });
    await fastify.register(watchlistPlugin, { prefix: '/api/watchlist' });
    await fastify.register(docsPlugin);

    fastify.setErrorHandler(errorHandler);
    fastify.setNotFoundHandler(notFoundHandler);

    return fastify;
};
