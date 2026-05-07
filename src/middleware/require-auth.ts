import type { FastifyRequest, FastifyReply } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';

export const requireAuth = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const sessionData = await auth.api.getSession({
        headers: fromNodeHeaders(request.raw.headers),
    });

    if (!sessionData) {
        request.log.warn(
            { path: request.url },
            'Unauthenticated request rejected'
        );
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    request.user = sessionData.user;
    request.session = sessionData.session;
    request.log = request.log.child({ userId: sessionData.user.id });
};
