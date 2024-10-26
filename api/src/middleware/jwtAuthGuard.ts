import jwt from '@elysiajs/jwt';
import { env } from 'bun';
import Elysia from 'elysia';

export const JwtAuthGuard = new Elysia({ name: 'AuthHandler' })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET as string,
      exp: '7d',
    }),
  )
  .use(
    jwt({
      name: 'refreshJwt',
      secret: env.RT_SECRET as string,
    }),
  )
  .derive({ as: 'scoped' }, ({ headers, error }) => {})
  .macro(({ onBeforeHandle }) => ({
    isSignIn(value: boolean = false) {
      onBeforeHandle(async ({ jwt, headers, set, error }) => {
        const setUnauthorizedResponse = () => {
          set.status = 401;
          set.headers['WWW-Authenticate'] =
            `Bearer realm='sign', error="invalid_request"`;
          return {
            status: 'error',
            message: 'Unauthorized',
          };
        };

        const auth = headers['authorization'];
        if (!auth) return error(400);
        const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
        const profile = await jwt.verify(bearer!);

        if (!profile) {
          return setUnauthorizedResponse();
        }
      });
    },
  }));
