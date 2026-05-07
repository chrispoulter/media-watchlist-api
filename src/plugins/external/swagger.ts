import fp from 'fastify-plugin';
import fastifyApiReference from '@scalar/fastify-api-reference';
import fastifySwagger from '@fastify/swagger';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { version } from '../../lib/config.js';
import { auth } from '../../lib/auth.js';

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

    fastify.get('/openapi.json', async () => {
        const appSpec = fastify.swagger();

        const authResponse = await auth.api.generateOpenAPISchema();

        return {
            ...appSpec,
            paths: {
                ...appSpec.paths,
                ...Object.fromEntries(
                    Object.entries(authResponse.paths ?? {}).map(
                        ([path, val]) => [`/api/auth${path}`, val]
                    )
                ),
            },
            components: {
                schemas: {
                    ...authResponse.components?.schemas,
                },
            },
        };
    });

    await fastify.register(fastifyApiReference, {
        routePrefix: '/reference',
        configuration: {
            pageTitle: 'Media Watchlist API',
            url: '/openapi.json',
        },
    });
});
