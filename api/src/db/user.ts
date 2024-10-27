import { accounts, user } from '@/drizzle/schema';
import { env, password } from 'bun';

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

const createAdminUser = async (db: any) => {
  try {
    const admin = createByAdmin();
    const username = env.USER_ADMIN!;
    const hashedPassword = await hashPassword(env.USER_PASSWORD!);

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
  } catch (error) {
    console.error('Error creating user with account:', error);
    throw error;
  }
};

export { createAdminUser };
