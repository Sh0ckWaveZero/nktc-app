import { accounts, user } from '@/drizzle/schema';
import { env, password } from 'bun';
import { Db } from './seed';

const createByAdmin = () => {
  const startDate = new Date();
  return {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };
};

const hashPassword = async (plainPassword: string) => {
  return await password.hash(plainPassword);
};

const createAdminUser = async (db: Db) => {
  try {
    const admin = createByAdmin();
    const username = env.USER_ADMIN;
    const plainPassword = env.USER_PASSWORD;

    if (!username || !plainPassword) {
      throw new Error(
        'Admin username or password is not defined in environment variables',
      );
    }

    const hashedPassword = await hashPassword(plainPassword);

    await db.transaction(async (trx: any) => {
      // Insert into user table
      const [newUser] = await trx
        .insert(user)
        .values({
          username: username,
          password: hashedPassword,
          role: 'Admin',
          ...admin,
        })
        .returning();

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

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating user with account:', error);
    throw error;
  }
};

export { createAdminUser };
