import { drizzle } from 'drizzle-orm/node-postgres';
import { DefaultLogger, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { HealthStatus } from '../types/health.js';
import { config } from '../lib/config.js';
import { logger } from '../lib/logger.js';

export const db = drizzle(config.DATABASE_URL, {
    logger: new DefaultLogger({
        writer: {
            write: (message) => logger.debug({ sql: message }, 'query'),
        },
    }),
});

export const shutdown = async () => {
    const client = db.$client;
    if (client instanceof Pool) {
        await client.end();
    }
};

export const check = async (): Promise<HealthStatus> => {
    try {
        await db.execute(sql`SELECT 1`);
        return { name: 'database', status: 'ok' };
    } catch (err) {
        logger.error({ err }, 'Database health check failed');

        return {
            name: 'database',
            status: 'unhealthy',
        };
    }
};
