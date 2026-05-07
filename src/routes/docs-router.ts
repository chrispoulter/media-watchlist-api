import type { FastifyPluginAsync } from 'fastify';
import type { OpenAPIV3 } from 'openapi-types';
import apiReference from '@scalar/fastify-api-reference';
import { auth } from '../lib/auth.js';

const docsPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/openapi.json', async (_request, reply) => {
        const spec = fastify.swagger() as unknown as OpenAPIV3.Document;
        const authSchema = await auth.api.generateOpenAPISchema();

        const authPaths = Object.fromEntries(
            Object.entries(authSchema.paths ?? {}).map(([path, pathItem]) => [
                `/api/auth${path}`,
                pathItem,
            ])
        );

        return reply.send({
            ...spec,
            paths: { ...authPaths, ...(spec.paths ?? {}) },
            components: {
                ...(spec.components ?? {}),
                schemas: {
                    ...(authSchema.components?.schemas ?? {}),
                    ...(spec.components?.schemas ?? {}),
                },
            },
        });
    });

    await fastify.register(apiReference, {
        routePrefix: '/reference',
        configuration: {
            url: '/openapi.json',
            pageTitle: 'Media Watchlist API',
        },
    });

    fastify.get('/', async (_request, reply) => {
        return reply.redirect('/reference');
    });
};

export default docsPlugin;
