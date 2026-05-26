import type { Context } from 'hono';
import { logger } from '../lib/logger.js';
import type { AppEnv } from '../types/hono.js';

export const errorHandler = (err: Error, c: Context<AppEnv>) => {
    const user = c.get('user');
    const log = c.get('logger') ?? logger;
    log.error({ err, userId: user?.id }, 'Unhandled error');
    return c.json({ error: 'Internal Server Error' }, 500);
};
