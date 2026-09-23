import { AsyncLocalStorage } from 'node:async_hooks';
import {
    configure,
    getConsoleSink,
    ansiColorFormatter,
    jsonLinesFormatter,
} from '@logtape/logtape';
import {
    redactByPattern,
    redactByField,
    EMAIL_ADDRESS_PATTERN,
    JWT_PATTERN,
} from '@logtape/redaction';
import { config } from './config.js';

const isDev = process.env['NODE_ENV'] !== 'production';
const formatter = isDev ? ansiColorFormatter : jsonLinesFormatter;

const consoleSink = redactByField(
    getConsoleSink({
        formatter: redactByPattern(formatter, [
            EMAIL_ADDRESS_PATTERN,
            JWT_PATTERN,
        ]),
    })
);

await configure({
    sinks: { console: consoleSink },
    loggers: [
        {
            category: ['hono'],
            sinks: ['console'],
            lowestLevel: config.LOG_LEVEL,
        },
        {
            category: ['api'],
            sinks: ['console'],
            lowestLevel: config.LOG_LEVEL,
        },
        {
            category: ['drizzle-orm'],
            sinks: ['console'],
            lowestLevel: config.LOG_LEVEL,
        },
        {
            category: ['logtape', 'meta'],
            sinks: ['console'],
            lowestLevel: 'warning',
        },
    ],
    contextLocalStorage: new AsyncLocalStorage(),
});
