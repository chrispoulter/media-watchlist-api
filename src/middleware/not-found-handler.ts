import type { Context } from 'hono';
import type { AppEnv } from '../types/hono.js';

export const notFoundHandler = (c: Context<AppEnv>) => {
     const log = c.get('logger');
    log.warn({ path: c.req.path }, 'Request to unknown endpoint');
    return c.json({ error: 'Not Found' }, 404);
};
