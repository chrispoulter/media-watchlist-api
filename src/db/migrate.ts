import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

console.log('Migrating database...');

const db = drizzle(process.env.DATABASE_URL!);

try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrated successfully');
} finally {
    await db.$client.end();
}
