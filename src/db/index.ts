import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import postgres from 'postgres'
import { type HealthcheckResult } from '../lib/health.js'
import { logger } from '../lib/logger.js'
import { config } from '../lib/config.js'

const client = postgres(config.DATABASE_URL)

export const db = drizzle(client)

export const healthCheck = async (): Promise<HealthcheckResult> => {
    try {
        await db.execute(sql`SELECT 1`)
        return { service: 'database', success: true }
    } catch (err) {
        logger.error(
            { error: err instanceof Error ? err.message : err },
            'Database health check failed'
        )

        return {
            service: 'database',
            success: false,
        }
    }
}
