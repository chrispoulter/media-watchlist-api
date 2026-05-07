import type { Request } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-vercel-id'] ?? crypto.randomUUID(),
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) {
            return 'error';
        }

        if (res.statusCode >= 400) {
            return 'warn';
        }

        return 'info';
    },
    customProps: (req: Request) => ({
        userId: req.user?.id,
    }),
    autoLogging: {
        ignore: (req) => req.url === '/health',
    },
});
