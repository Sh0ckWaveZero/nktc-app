import { usersHandler } from '../handlers/users.handler';
import { apiMiddleware } from '../middleware/ApiMiddleware';

export function configureUsersRoutes(app: any) {
  return app
    .get("/", usersHandler.getUsers, {
      beforeHandle: apiMiddleware
    })
    // .guard({ body: usersHandler.validateCreateUser }, (guardApp) =>
    //     guardApp
    //         .post("/", usersHandler.createUser)
    // )
    .get("/:id", usersHandler.getUserById, {
      beforeHandle: apiMiddleware
    })
    .delete("/:id", usersHandler.deleteUser, {
      beforeHandle: apiMiddleware
    })
    .post("/login", usersHandler.loginUser)
}