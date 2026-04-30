import pino from 'pino';
import pretty from 'pino-pretty';

const isDev = process.env['NODE_ENV'] !== 'production';

const stream = pretty({
    colorize: isDev,
    translateTime: 'SYS:standard',
    sync: true,
});

export const logger = pino(
    {
        level: process.env['LOG_LEVEL'] ?? 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        base: { service: 'media-watchlist-api' },
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
    },
    stream
);
