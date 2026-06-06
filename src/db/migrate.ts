import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

console.log('Migrating database...');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrated successfully');
} finally {
    await pool.end();
}
