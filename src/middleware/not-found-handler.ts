import type { FastifyRequest, FastifyReply } from 'fastify';

export const notFoundHandler = (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    request.log.warn({ path: request.url }, 'Request to unknown endpoint');
    reply.code(404).send({ error: 'Not Found' });
};
