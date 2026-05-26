import type { Context } from 'hono';
import type { AppEnv } from '../types/hono.js';

export const notFoundHandler = (c: Context<AppEnv>) => {
    c.get('logger').warn({ path: c.req.path }, 'Request to unknown endpoint');
    return c.json({ error: 'Not Found' }, 404);
};
