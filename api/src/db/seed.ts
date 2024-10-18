import { accounts, user } from '@/drizzle/schema';
import { env, password } from 'bun';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../drizzle/schema';

const client = new pg.Client({
  connectionString: env.DRIZZLE_DATABASE_URL,
});

const db = drizzle(client, { schema });

const createByAdmin = () => {
  const startDate = new Date();
  return {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };
};

async function createUserWithAccount(
  username: string,
  password: string,
  admin: any,
) {
  try {
    await db.transaction(async (trx) => {
      // Insert into user table
      const [newUser] = await trx
        .insert(user)
        .values({
          username: username,
          password: password,
          role: 'Admin',
          ...admin,
        })
        .returning();
      console.log('New User:', JSON.stringify(newUser, null, 2));

      // Insert into account table using the user ID
      await trx
        .insert(accounts)
        .values({
          userId: newUser.id,
          firstName: 'แอดมิน',
          lastName: 'มัดหมี่',
          ...admin,
        })
        .returning();
    });
  } catch (error) {
    console.error('Error creating user with account:', error);
    throw error;
  }
}

async function seed() {
  try {
    await client.connect();

    const admin = createByAdmin();
    const username = env.USER_ADMIN!;
    const hashedPassword = await password.hash(env.USER_PASSWORD! as string);

    await createUserWithAccount(username, hashedPassword, admin);

    console.log('Seed completed');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await client.end();
  }
}

seed();
