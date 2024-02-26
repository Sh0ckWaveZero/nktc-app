import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { AuthenticationError } from './exceptions/authenticationError';
import { AuthorizationError } from './exceptions/authorizationError';
import { InvariantError } from './exceptions/invariantError';
import { env } from 'bun';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';
import { configureAuthenticationsRoutes } from './routes/authentications.route';
import { configureUsersRoutes } from './routes/users.route';
import { cookie } from '@elysiajs/cookie';

export const app = new Elysia({
  // prefix: env.BUN_PREFIX,
  serve: {
    hostname: env.BUN_HOST
  }
})
  .error('AUTHENTICATION_ERROR', AuthenticationError)
  .error('AUTHORIZATION_ERROR', AuthorizationError)
  .error('INVARIANT_ERROR', InvariantError)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'AUTHENTICATION_ERROR':
        set.status = 401
        return {
          status: "error",
          message: error.toString()
        }
      case 'AUTHORIZATION_ERROR':
        set.status = 403
        return {
          status: "error",
          message: error.toString()
        }
      case 'INVARIANT_ERROR':
        set.status = 400
        return {
          status: "error",
          message: error.toString()
        }
      case 'NOT_FOUND':
        set.status = 404
        return {
          status: "error",
          message: error.toString()
        }
      case 'INTERNAL_SERVER_ERROR':
        set.status = 500
        return {
          status: "error",
          message: "Something went wrong!"
        }
    }
  })
  .use(jwt({
    name: 'jwt',
    secret: env.JWT_SECRET as string,
    exp: '7d'
  }))
  .use(jwt({
    name: 'refreshJwt',
    secret: env.RT_SECRET as string,
  }))
  .use(cookie())
  .use(cors())
  .use(bearer())
  .use(swagger({
    path: "/docs"
  }));

app
  .get("/", () => `Welcome to Bun NKTC`)
  .group("/users", configureUsersRoutes)
  .group("/authentications", configureAuthenticationsRoutes)

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
