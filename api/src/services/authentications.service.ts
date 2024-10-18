import { db } from '@/db';
import { user } from '@/drizzle/schema';
import { InvariantError } from '@/exceptions/invariantError';
import { PrismaClient } from '@prisma/client';
import { eq } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

class AuthenticationsService {
  constructor(private db: PrismaClient = new PrismaClient()) {}
  async verifyRefreshToken(refresh_token: string) {
    const token = await db
      .select()
      .from(user)
      .where(eq(user.refreshToken, refresh_token));

    // const token = await this.db.user.findFirst({
    //   where: {
    //     refreshToken: refresh_token,
    //   },
    // });

    if (!token) throw new NotFoundError('Token is incorrect!');
  }

  async addRefreshToken(userId: string, hash: string) {
    const usersTable = await db
      .update(user)
      .set({
        refreshToken: hash,
      })
      .where(eq(user.id, userId))
      .returning({
        refreshToken: user.refreshToken,
      });

    if (!usersTable) throw new InvariantError('Token failed to be added');

    return usersTable[0].refreshToken;

    // const token = await this.db.user.update({
    //   where: {
    //     id: userId,
    //   },
    //   data: {
    //     refreshToken: hash,
    //   },
    //   select: {
    //     refreshToken: true,
    //   },
    // });

    // if (!token) throw new InvariantError('Token failed to be added');

    // return token.refreshToken;
  }
}

export const authenticationsService = new AuthenticationsService();
