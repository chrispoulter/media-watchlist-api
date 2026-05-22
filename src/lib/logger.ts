import pino from 'pino';
import { config, release } from './config.js';

const isDev = process.env['NODE_ENV'] !== 'production';

const destination = isDev
    ? undefined
    : pino.destination({ dest: 1, sync: true });

export const logger = pino(
    {
        level: config.LOG_LEVEL,
        timestamp: pino.stdTimeFunctions.isoTime,
        base: { service: 'media-watchlist-api', release },
        redact: {
            paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["set-cookie"]',
                'req.body.password',
                'req.body.newPassword',
                'req.body.token',
                '*.secret',
                '*.accessToken',
                '*.refreshToken',
                '*.backupCodes',
            ],
            censor: '[REDACTED]',
        },
        ...(isDev && {
            transport: {
                target: 'pino-pretty',
                options: { colorize: true, translateTime: 'SYS:standard' },
            },
        }),
    },
    destination
);
