import { drizzle } from 'drizzle-orm/node-postgres';
import { type Logger, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import type { HealthStatus } from '../types/index.js';
import { config } from '../lib/config.js';
import { logger } from '../lib/logger.js';

class DrizzleQueryLogger implements Logger {
    logQuery(query: string, params: unknown[]): void {
        logger.debug({ query, params }, 'query');
    }
}

export const db = drizzle(config.DATABASE_URL, {
    logger: new DrizzleQueryLogger(),
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
