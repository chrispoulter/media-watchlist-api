import type { Request } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

export const requestLogger = pinoHttp({
    logger,
<<<<<<< HEAD
    customProps: (req: Request) => ({
        userId: req.user?.id,
    }),
=======
    genReqId: (req) => req.headers['x-vercel-id'] ?? crypto.randomUUID(),
>>>>>>> 0b28bda715210065fa1339c86d94f7bdbd831190
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) {
            return 'error';
        }

        if (res.statusCode >= 400) {
            return 'warn';
        }

        return 'info';
    },
    autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/alive',
    },
});
