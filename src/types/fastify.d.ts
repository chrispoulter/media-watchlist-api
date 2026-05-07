import type { User, Session } from '../lib/auth.js';

declare module 'fastify' {
    interface FastifyRequest {
        user: User | null;
        session: Session | null;
    }
}
