import { userController } from '@/controllers/users.controller';
import { apiMiddleware } from '@/middleware/ApiMiddleware';
import Elysia from 'elysia';

export const usersRoutes = new Elysia().group('/users', (app) =>
  app
    .get('/', userController.getUsers, {
      beforeHandle: apiMiddleware,
    })
    .get('/:id', userController.getUserById, {
      beforeHandle: apiMiddleware,
    })
    .delete('/:id', userController.deleteUser, {
      beforeHandle: apiMiddleware,
    })
    .post('/login', userController.loginUser),
);
