import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { type HealthcheckResult } from '../lib/health.js';
import { logger } from '../lib/logger.js';
import { config } from '../lib/config.js';

export const db = drizzle(config.DATABASE_URL, { logger: true });

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
