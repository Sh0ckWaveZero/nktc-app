import { isAuthenticated } from '@/middleware';
import { AuthModel } from '@/model/auth.model';
import { authService } from '@/services/auth.service';
import { generateCsrfToken, setCsrfCookie } from '@/util/csrf';
import Elysia from 'elysia';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(isAuthenticated)
  .use(AuthModel)
  .get('/csrf-token', async ({ cookie: { name }, set }) => {
    const token = await generateCsrfToken();
    console.log('🚀 ~ .get ~ token:', token);

    name.set({
      domain: 'localhost',
      httpOnly: true,
      maxAge: 7200,
    });

    set.headers = {
      'Set-Cookie': setCsrfCookie(token),
    };

    return {
      message: 'CSRF token successfully generated',
    };
  })
  .post('/login', authService.loginHandler, {
    body: 'auth.login',
  })
  .put(
    '/update/password',
    async (context) => {
      return true;
    },
    {
      body: 'auth.updatePassword',
      isSignIn: true,
    },
  )
  .put('/', authService.updateAccessToken);
