import { db } from '@/db';
import { user } from '@/drizzle/schema';
import { AuthenticationError } from '@/exceptions/authenticationError';
import { InvariantError } from '@/exceptions/invariantError';
import { and, eq } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

interface loginPayload {
  username: string;
  password: string;
}

class UsersService {
  constructor() {}

  async getUsers() {
    return await db
      .select({
        id: user.id,
        username: user.username,
        email: user.email,
      })
      .from(user);
  }

  async getUserById(id: string) {
    const [userInfo] = await db
      .select({
        id: user.id,
        username: user.username,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, id))
      .catch((err) => {
        throw new NotFoundError('User not found');
      });

    return userInfo;
  }

  async deleteUser(id: string) {
    return await db.delete(user).where(eq(user.id, id)).returning();
  }

  async getPasswordByUsername(username: string) {
    const [getPassword] = await db
      .select({
        password: user.password,
      })
      .from(user)
      .where(eq(user.username, username))
      .catch((err) => {
        throw new InvariantError('Username is not found!');
      });

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
    try {
      const [selectedUser] = await db
        .select({
          id: user.id,
        })
        .from(user)
        .where(eq(user.username, username))
        .catch((err) => {
          throw new AuthenticationError('❌ User not found!');
        });

      return selectedUser;
    } catch (err) {
      console.error('Error verifying user by username:', err);
      throw new AuthenticationError('Username or password is wrong!');
    }
  }

  async verifyUserById(id: string) {
    const [userInfo] = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.id, id))
      .catch((err) => {
        throw new AuthenticationError('❌ You have no access!');
      });

    return userInfo;
  }

  async verifyUsernameIsAvailable(username: string) {
    const [isAvailable] = await db
      .select({
        username: user.username,
      })
      .from(user)
      .where(eq(user.username, username))
      .catch((err) => {
        throw new InvariantError('❌ Username already exist!');
      });

    return isAvailable;
  }
}

export const usersService = new UsersService();
