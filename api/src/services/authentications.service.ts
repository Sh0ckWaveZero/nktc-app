import { DbClient } from '@/db';
import { user } from '@/drizzle/schema';
import { InvariantError } from '@/exceptions/invariantError';
import { eq } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

class AuthenticationsService {
  constructor(private db: DbClient) {}
  async verifyRefreshToken(refresh_token: string) {
    const token = await this.db
      .select()
      .from(user)
      .where(eq(user.refreshToken, refresh_token))
      .catch((err) => {
        throw new NotFoundError('Token is incorrect!');
      });

    return token;
  }

  async addRefreshToken(userId: string, hash: string) {
    const usersTable = await this.db
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
  }
}

export const authenticationsService = new AuthenticationsService(DbClient);
