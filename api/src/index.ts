import { bearer } from '@elysiajs/bearer';
import { cors } from '@elysiajs/cors';
import { env } from 'bun';
import { Elysia } from 'elysia';
import { swaggerConfig } from './config/swagger';
import { initializeDbConnection } from './db';
import { AuthenticationError } from './exceptions/authenticationError';
import { AuthorizationError } from './exceptions/authorizationError';
import { InvariantError } from './exceptions/invariantError';
import { authRoutes } from './routes/auth.route';
import { usersRoutes } from './routes/users.route';

export const app = new Elysia({
  // prefix: env.BUN_PREFIX,
  serve: {
    hostname: env.BUN_HOST,
  },
})
  .trace(async ({ onHandle }) => {
    onHandle(({ begin, onStop }) => {
      onStop(({ end }) => {
        console.log('🪝 handle took', end - begin, 'ms');
      });
    });
  })
  .use(cors())
  .use(bearer())
  .use(swaggerConfig())
  .get('/', () => `Welcome to Bun NKTC`)
  .use(authRoutes)
  .use(usersRoutes)
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

export type AppType = typeof app;

initializeDbConnection()
  .then(() => {
    app.listen(env.PORT || 3001, () => {
      console.log(`🦊 Elysia is running at ${env.PORT || 3001}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database connection:', error);
  });
