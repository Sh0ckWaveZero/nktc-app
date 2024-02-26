import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { InvariantError } from '../exceptions/invariantError';


const db = new PrismaClient();

class AuthenticationsService {
  async verifyRefreshToken(refresh_token: string) {
    const token = await db.user.findFirst({
      where: {
        refreshToken: refresh_token,
      },
    });

    if (!token) throw new NotFoundError("Token is incorrect!");
  }

  async addRefreshToken(userId: string, hash: string) {
    const token = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hash,
      },
      select: {
        refreshToken: true,
      },
    });

    if (!token) throw new InvariantError("Token failed to be added");

    return token.refreshToken;
  }
}

export const authenticationsService = new AuthenticationsService();