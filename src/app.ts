import path from 'node:path';
import fastifyAutoload from '@fastify/autoload';
import { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
    hasZodFastifySchemaValidationErrors,
    isResponseSerializationError,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod';

export default async function serviceApp(
    fastify: FastifyInstance,
    opts: FastifyPluginOptions
) {
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    fastify.register(fastifyAutoload, {
        dir: path.join(import.meta.dirname, 'plugins/external'),
        options: {},
    });

    fastify.register(fastifyAutoload, {
        dir: path.join(import.meta.dirname, 'plugins/app'),
        options: { ...opts },
    });

    fastify.register(fastifyAutoload, {
        dir: path.join(import.meta.dirname, 'routes'),
        autoHooks: true,
        cascadeHooks: true,
        options: { ...opts },
    });

    fastify.setErrorHandler((err: FastifyError, request, reply) => {
        if (hasZodFastifySchemaValidationErrors(err)) {
            return reply.code(400).send({
                error: 'Request Validation Error',
                message: "Request doesn't match the schema",
                statusCode: 400,
                details: {
                    issues: err.validation,
                    method: request.method,
                    url: request.url,
                },
            });
        }

        if (isResponseSerializationError(err)) {
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: "Response doesn't match the schema",
                statusCode: 500,
                details: {
                    issues: err.cause.issues,
                    method: request.method,
                    url: request.url,
                },
            });
        }

        fastify.log.error(
            {
                err,
                request: {
                    method: request.method,
                    url: request.url,
                    query: request.query,
                    params: request.params,
                },
            },
            'Unhandled error occurred'
        );

        reply.code(err.statusCode ?? 500);

        let message = 'Internal Server Error';
        if (err.statusCode && err.statusCode < 500) {
            message = err.message;
        }

        return { message };
    });

    fastify.setNotFoundHandler((request, reply) => {
        request.log.warn(
            {
                request: {
                    method: request.method,
                    url: request.url,
                    query: request.query,
                    params: request.params,
                },
            },
            'Resource not found'
        );

        reply.code(404);

        return { message: 'Not Found' };
    });
}
