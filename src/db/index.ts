import { drizzle } from 'drizzle-orm/node-postgres';
import { DefaultLogger, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { type HealthcheckResult } from '../lib/health.js';
import { logger } from '../lib/logger.js';
import { config } from '../lib/config.js';

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

export const healthCheck = async (): Promise<HealthcheckResult> => {
    try {
        await db.execute(sql`SELECT 1`);
        return { service: 'database', success: true };
    } catch (err) {
        logger.error(
            { error: err instanceof Error ? err.message : err },
            'Database health check failed'
        );

        return {
            service: 'database',
            success: false,
        };
    }
};
