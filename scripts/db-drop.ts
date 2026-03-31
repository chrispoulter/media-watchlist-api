import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const { hostname, port, username, password, pathname } = new URL(url);
const dbName = pathname.slice(1);

const sql = postgres({
  host: hostname,
  port: Number(port) || 5432,
  user: username,
  password,
  database: "postgres",
  max: 1,
});

const rows = await sql`SELECT 1 FROM pg_database WHERE datname = ${dbName}`;

if (rows.length === 0) {
  console.log(`Database '${dbName}' does not exist`);
} else {
  await sql.unsafe(`DROP DATABASE "${dbName}"`);
  console.log(`Database '${dbName}' dropped`);
}

await sql.end();
