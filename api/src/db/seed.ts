import { env } from 'bun';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../drizzle/schema';
import { createAdminUser } from './user';

const client = new pg.Client({
  connectionString: env.DRIZZLE_DATABASE_URL,
});

const db = drizzle(client, { schema });

export type Db = ReturnType<typeof drizzle>;

async function seed() {
  try {
    await client.connect();

    await createAdminUser(db);

    console.log('Seed completed');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await client.end();
  }
}

seed();
