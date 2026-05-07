import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { auth, User } from '../../lib/auth.js';

declare module 'fastify' {
    export interface FastifyRequest {
        user?: User;
    }
}

export async function requireAuth(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
}

export default fp(
    async function (fastify) {
        fastify.addHook('onRequest', async (request) => {
            const headers = new Headers();

            for (const [key, value] of Object.entries(request.headers)) {
                if (typeof value === 'string') {
                    headers.set(key, value);
                } else if (Array.isArray(value)) {
                    headers.set(key, value.join(', '));
                }
            }

            const session = await auth.api.getSession({ headers });
            request.user = session?.user;
        });
    },
    { name: 'authorization' }
);
