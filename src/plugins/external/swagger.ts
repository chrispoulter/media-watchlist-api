import fp from 'fastify-plugin';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifySwagger from '@fastify/swagger';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export default fp(async function (fastify) {
    await fastify.register(fastifySwagger, {
        hideUntagged: true,
        openapi: {
            info: {
                title: 'Fastify demo API',
                description: 'The official Fastify demo API',
                version: '0.0.0',
            },
        },
        transform: jsonSchemaTransform,
    });

    await fastify.register(fastifySwaggerUi, {
        routePrefix: '/api/docs',
    });
});
