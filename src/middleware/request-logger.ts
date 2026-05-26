import { pinoLogger } from 'hono-pino';
import { logger } from '../lib/logger.js';

export const requestLogger = pinoLogger({
    pino: logger,
    http: {
        onResLevel: (c) => {
            if (c.req.path === '/health' || c.req.path === '/alive') {
                return 'trace';
            }
            if (c.error || c.res.status >= 500) {
                return 'error';
            }
            if (c.res.status >= 400) {
                return 'warn';
            }
            return 'info';
        },
        onResBindings: (c) => {
            const user = c.get('user');

            return {
                userId: user?.id,
                res: {
                    status: c.res.status,
                },
            };
        },
    },
});
