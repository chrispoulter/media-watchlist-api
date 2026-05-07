import { drizzle } from 'drizzle-orm/node-postgres';
import { DefaultLogger, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { type HealthcheckResult } from '../lib/health.js';

export const db = drizzle(process.env.DATABASE_URL, {
    logger: new DefaultLogger({
        writer: {
            write: (message) => console.debug({ sql: message }, 'query'),
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
        console.error(
            { error: err instanceof Error ? err.message : err },
            'Database health check failed'
        );

        return {
            service: 'database',
            success: false,
        };
    }
};
