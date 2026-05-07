import fp from 'fastify-plugin';
import { User } from '../../lib/auth.js';

declare module 'fastify' {
    export interface FastifyRequest {
        user: User | null;
    }
}

export default fp(async function () {}, { name: 'authorization' });
