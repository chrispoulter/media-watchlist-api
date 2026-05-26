import type { Context } from 'hono';
import type { AppEnv } from '../types/hono.js';

export const notFoundHandler = (c: Context<AppEnv>) => {
    c.var.logger
        .withMetadata({ path: c.req.path })
        .warn('Request to unknown endpoint');

    return c.json({ error: 'Not Found' }, 404);
};
