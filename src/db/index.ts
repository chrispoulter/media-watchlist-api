import { drizzle } from 'drizzle-orm/node-postgres';
import { DefaultLogger, sql } from 'drizzle-orm';
import { Pool } from 'pg';
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

export const check = async (): Promise<{
    service: string;
    status: 'ok' | 'unhealthy';
}> => {
    try {
        await db.execute(sql`SELECT 1`);
        return { service: 'database', status: 'ok' };
    } catch (err) {
        logger.error(
            { error: err instanceof Error ? err.message : err },
            'Database health check failed'
        );

        return {
            service: 'database',
            status: 'unhealthy',
        };
    }
};
