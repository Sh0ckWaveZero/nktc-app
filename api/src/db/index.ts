import * as schema from '@/drizzle/schema';
import { env } from 'bun';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: env.DRIZZLE_DATABASE_URL!,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('🚀 Connected to database');
});

export const db = drizzle(pool, { schema });
