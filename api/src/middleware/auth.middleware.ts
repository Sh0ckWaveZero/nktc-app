import { DEFAULT, HEADER_KEY } from '@/common/constants';
import jwt from '@elysiajs/jwt';
import { env } from 'bun';
import Elysia from 'elysia';

export const isAuthenticated = new Elysia({ name: 'AuthHandler' })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET as string,
      exp: DEFAULT.JWT_ACCESS_TOKEN_EXPIRED,
    }),
  )
  .use(
    jwt({
      name: 'refreshJwt',
      secret: env.RT_SECRET as string,
      exp: DEFAULT.JWT_REFRESH_TOKEN_EXPIRED,
    }),
  )
  .macro(({ onBeforeHandle }) => ({
    isSignIn(value: boolean = false) {
      onBeforeHandle(async ({ jwt, request: { headers }, set, error }) => {
        const setUnauthorizedResponse = () => {
          set.status = 401;
          set.headers['WWW-Authenticate'] =
            `Bearer realm='sign', error="invalid_request"`;
          return {
            status: 'error',
            message: 'Unauthorized',
          };
        };

        const authorization: string | null = headers.get(
          HEADER_KEY.AUTHORIZATION,
        );
        if (!authorization) return error(400);
        const bearer = authorization?.startsWith('Bearer ')
          ? authorization.slice(7)
          : null;
        const payload = await jwt.verify(bearer!);

        if (!payload) {
          return setUnauthorizedResponse();
        }
      });
    },
  }));
