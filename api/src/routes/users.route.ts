import { userController } from '@/controllers/users.controller';
import { apiMiddleware } from '@/middleware/ApiMiddleware';

export function initializeUsersRoutes(app: any) {
  return (
    app
      .get('/', userController.getUsers, {
        beforeHandle: apiMiddleware,
      })
      // .guard({ body: usersHandler.validateCreateUser }, (guardApp) =>
      //     guardApp
      //         .post("/", usersHandler.createUser)
      // )
      .get('/:id', userController.getUserById, {
        beforeHandle: apiMiddleware,
      })
      .delete('/:id', userController.deleteUser, {
        beforeHandle: apiMiddleware,
      })
      .post('/login', userController.loginUser)
  );
}
