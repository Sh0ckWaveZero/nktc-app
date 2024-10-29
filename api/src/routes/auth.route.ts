import { isAuthenticated } from '@/middleware';
import { AuthModel } from '@/model/auth.model';
import { authService } from '@/services/auth.service';
import Elysia from 'elysia';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(isAuthenticated)
  .use(AuthModel)
  .post('/login', authService.loginHandler, {
    body: 'auth.login',
  })
  .put(
    '/update/password',
    async (context) => {
      // console.log('🚀 ~ .put ~ context:', context);
      return true;
    },
    {
      body: 'auth.updatePassword',
      isSignIn: true,
    },
  )
  .put('/', authService.updateAccessToken);
