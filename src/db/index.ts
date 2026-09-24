import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { getLogger } from '@logtape/logtape';
import { getLogger as getDrizzleLogger } from '@logtape/drizzle-orm';
import type { HealthStatus } from '../types/index.js';
import { config } from '../lib/config.js';

const logger = getLogger(['api', 'db']);

export const db = drizzle(config.DATABASE_URL, {
    logger: getDrizzleLogger(),
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
        logger.error('Database health check failed {*}', { err });
        return { name: 'database', status: 'unhealthy' };
    }
};
