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

/**
 * Database client initialized with drizzle and PostgreSQL pool.
 */
export const DbClient = drizzle(pool, { schema });

/**
 * Type definition for the database client.
 */
export type DbClient = ReturnType<typeof drizzle>;

/**
 * Initializes the database connection.
 * Attempts to connect to the database and logs the result.
 * If the connection fails, the process exits with an error code.
 *
 * @async
 * @function initializeDbConnection
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
 */
export async function initializeDbConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
  } catch (err) {
    console.error('❌ Cannot connect to the database', err);
    process.exit(-1);
  }
}
