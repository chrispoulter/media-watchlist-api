import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
}

console.log('Migrating database...');

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pool });

try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrated successfully');
} finally {
    await pool.end();
}
