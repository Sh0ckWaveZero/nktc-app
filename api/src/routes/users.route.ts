import { isAuthenticated } from '@/middleware';
import { userController } from '@/services/users.service';
import Elysia from 'elysia';

export const usersRoutes = new Elysia().group('/users', (app) =>
  app
    .use(isAuthenticated)
    .get('/', userController.getUsers)
    .get('/:id', userController.getUserById)
    .delete('/:id', userController.deleteUser)
    .post('/login', userController.loginUser),
);
