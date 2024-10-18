import { db } from '@/db';
import { user } from '@/drizzle/schema';
import { AuthenticationError } from '@/exceptions/authenticationError';
import { AuthorizationError } from '@/exceptions/authorizationError';
import { InvariantError } from '@/exceptions/invariantError';
import { PrismaClient } from '@prisma/client';
import { and, eq } from 'drizzle-orm';
import { NotFoundError, t } from 'elysia';

interface loginPayload {
  username: string;
  password: string;
}

class UsersService {
  constructor(private db = new PrismaClient()) {}

  async getUsers() {
    return await this.db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.db.user.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async deleteUser(id: string) {
    await this.db.user.delete({
      where: {
        id: id,
      },
    });
  }

  async getPasswordByUsername(username: string) {
    const getPassword = await this.db.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
      select: {
        password: true,
      },
    });

    if (!getPassword) throw new InvariantError('Username is not found!');

    return getPassword.password;
  }

  async loginUser(body: loginPayload) {
    const [userInfo] = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(
        and(eq(user.username, body.username), eq(user.password, body.password)),
      )
      .catch((err) => {
        throw new AuthenticationError('Username or password is wrong!');
      });

    return userInfo;
  }

  async verifyUserByUsername(username: string) {
    const [userInfo] = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.username, username))
      .catch((err) => {
        throw new AuthenticationError('Username or password is wrong!');
      });

    return userInfo;
  }

  async verifyUserById(id: string) {
    const user = await this.db.user.findFirst({
      where: {
        username: {
          equals: id,
        },
      },
    });

    if (!user) throw new AuthorizationError('You have no access!');
  }

  async verifyUsernameIsAvailable(username: string) {
    const isAvailable = await this.db.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
    });

    if (isAvailable) throw new InvariantError('Username already exist!');
  }
}

export const usersService = new UsersService();
