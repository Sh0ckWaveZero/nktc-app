import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { InvariantError } from '../exceptions/invariantError';


const db = new PrismaClient();

export const authenticationsService = {
  verifyRefreshToken: async (refresh_token: string) => {
    const token = await db.user.findFirst({
      where: {
        refreshToken: refresh_token,
      },
    });

    if (!token) throw new NotFoundError("Token is incorrect!")
  },
  addRefreshToken: async (userId: string, hash: string) => {
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
    })


    if (!token) throw new InvariantError("Token failed to be added")

    return token.refreshToken
  }
}