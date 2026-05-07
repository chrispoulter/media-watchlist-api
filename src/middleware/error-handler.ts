import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export const errorHandler = (
    err: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    request.log.error({ err, userId: request.user?.id }, 'Unhandled error');
    reply.code(500).send({ error: 'Internal Server Error' });
};
