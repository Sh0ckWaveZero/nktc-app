import { bearer } from '@elysiajs/bearer';
import { cookie } from '@elysiajs/cookie';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { swagger } from '@elysiajs/swagger';
import { env } from 'bun';
import { Elysia } from 'elysia';
import { initializeDbConnection } from './db';
import { AuthenticationError } from './exceptions/authenticationError';
import { AuthorizationError } from './exceptions/authorizationError';
import { InvariantError } from './exceptions/invariantError';
import { initializeAuthRoutes } from './routes/authentications.route';
import { initializeUsersRoutes } from './routes/users.route';

export const app = new Elysia({
  // prefix: env.BUN_PREFIX,
  serve: {
    hostname: env.BUN_HOST,
  },
})
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
  .use(cookie())
  .use(cors())
  .use(bearer())
  .use(
    swagger({
      path: '/docs',
    }),
  )
  .get('/', () => `Welcome to Bun NKTC`)
  .group('/users', initializeUsersRoutes)
  .group('/auth', initializeAuthRoutes)
  .error('AUTHENTICATION_ERROR', AuthenticationError)
  .error('AUTHORIZATION_ERROR', AuthorizationError)
  .error('INVARIANT_ERROR', InvariantError)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'AUTHENTICATION_ERROR':
        set.status = 401;
        return {
          status: 'error',
          message: error.toString(),
        };
      case 'AUTHORIZATION_ERROR':
        set.status = 403;
        return {
          status: 'error',
          message: error.toString(),
        };
      case 'INVARIANT_ERROR':
        set.status = 400;
        return {
          status: 'error',
          message: error.toString(),
        };
      case 'NOT_FOUND':
        set.status = 404;
        return {
          status: 'error',
          message: error.toString(),
        };
      case 'INTERNAL_SERVER_ERROR':
        set.status = 500;
        return {
          status: 'error',
          message: 'Something went wrong!',
        };
    }
  });

initializeDbConnection()
  .then(() => {
    app.listen(env.PORT || 3001, () => {
      console.log(`🦊 Elysia is running at ${env.PORT || 3001}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database connection:', error);
  });