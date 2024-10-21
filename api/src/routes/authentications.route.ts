import { authController } from '@/controllers/auth.controller';
import Elysia from 'elysia';

export const authRoutes = new Elysia().group('/auth', (app) =>
  app
    .post('/login', authController.createAuthentication)
    .put('/', authController.updateAccessToken),
);
