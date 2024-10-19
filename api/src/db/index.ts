import * as schema from '@/drizzle/schema';
import { env } from 'bun';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionUrl = env.DRIZZLE_DATABASE_URL;

if (!connectionUrl) {
  throw new Error('DRIZZLE_DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: connectionUrl });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const DbClient = drizzle(pool, { schema });

export type DbClient = ReturnType<typeof drizzle>;

export async function initializeDbConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
  } catch (err) {
    console.error('❌ Cannot connect to the database', err);
    process.exit(-1);
  }
}
