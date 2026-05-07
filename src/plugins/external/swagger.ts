import fp from 'fastify-plugin';
import fastifyApiReference from '@scalar/fastify-api-reference';
import fastifySwagger from '@fastify/swagger';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { version } from '../../lib/config.js';

export default fp(async function (fastify) {
    await fastify.register(fastifySwagger, {
        hideUntagged: true,
        openapi: {
            info: {
                title: 'Media Watchlist API',
                description:
                    'REST API for managing a personal media watchlist.',
                version,
            },
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
        },
        transform: jsonSchemaTransform,
    });

    await fastify.register(fastifyApiReference, {
        routePrefix: '/reference',
        configuration: {
            pageTitle: 'Media Watchlist API',
            sources: [
                { title: 'Media Watchlist API' },
                {
                    url: '/api/auth/open-api/generate-schema',
                    title: 'Better Auth',
                },
            ],
        },
    });
});
