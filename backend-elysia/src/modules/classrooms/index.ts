import { Elysia, t } from "elysia";
import { ClassroomService } from "./service";
import { ClassroomModel } from "./model";
import { authGuard } from "@/middleware/auth";
import { ForbiddenError } from "@/libs/errors";

export const classrooms = new Elysia({ prefix: "/classrooms" })
  .use(authGuard)
  .guard(
    {
      detail: {
        tags: ["Classrooms"],
        security: [{ BearerAuth: [] }],
      },
    },
    (app) =>
      app
        .get(
          "/",
          async () => {
            return ClassroomService.getAll();
          },
          {
            detail: {
              summary: "Get all classrooms",
            },
          },
        )
        .post(
          "/",
          async ({ body, user, set }) => {
            const role = (user as any)?.roles;
            const userId = (user as any).sub;
            if (role === "Admin") {
              const classroom = await ClassroomService.create({
                ...(body as ClassroomModel["body"]),
                createdBy: userId,
              });
              set.status = 201;
              return classroom;
            }
            if (role === "Teacher") {
              const { departmentId: _ignored, ...teacherBody } =
                body as ClassroomModel["body"] & { departmentId?: string };
              const classroom = await ClassroomService.createAsTeacher(
                userId,
                teacherBody,
              );
              set.status = 201;
              return classroom;
            }
            throw new ForbiddenError();
          },
          {
            body: ClassroomModel.body,
            detail: {
              summary: "Create classroom (Admin: full, Teacher: scoped to own department)",
            },
          },
        )
        .get(
          "/:id",
          async ({ params: { id } }) => {
            return ClassroomService.getById(id);
          },
          {
            detail: {
              summary: "Get classroom by ID",
            },
          },
        )
        .patch(
          "/:id",
          async ({ params: { id }, body, user }) => {
            const role = (user as any)?.roles;
            const userId = (user as any).sub;
            if (role === "Teacher") {
              await ClassroomService.validateTeacherOwnsClassroom(userId, id);
            } else if (role !== "Admin") {
              throw new ForbiddenError();
            }
            return ClassroomService.update(id, {
              ...(body as ClassroomModel["partial"]),
              updatedBy: userId,
            });
          },
          {
            body: ClassroomModel.partial,
            detail: {
              summary: "Update classroom (Admin: any, Teacher: own classrooms only)",
            },
          },
        )
        .get(
          "/teacher/:id",
          async ({ params: { id } }) => {
            return ClassroomService.getByTeacher(id);
          },
          {
            detail: {
              summary: "Get classrooms by teacher ID",
            },
          },
        )
        .post(
          "/search",
          async ({ body }) => {
            const { departmentId, programId, levelId, name } = body as any;
            return ClassroomService.search({
              departmentId,
              programId,
              levelId,
              name,
            });
          },
          {
            body: t.Any(),
            detail: {
              summary: "Search classrooms with filters",
            },
          },
        )
        .delete(
          "/:id",
          async ({ params: { id }, user, set }) => {
            if ((user as any)?.roles !== "Admin") {
              throw new ForbiddenError();
            }
            await ClassroomService.delete(id);
            set.status = 204;
            return null;
          },
          {
            detail: {
              summary: "Delete a classroom",
            },
          },
        )
        .post(
          "/upload",
          async ({ body, user, set }) => {
            if ((user as any)?.roles !== "Admin") {
              set.status = 403;
              return { success: false, message: "Forbidden" };
            }
            const { file } = body as { file: string };
            return ClassroomService.importFromXLSX(file, (user as any).sub);
          },
          {
            body: ClassroomModel.uploadBody,
            detail: {
              summary: "Upload classroom batch via XLSX",
            },
          },
        )
        .get(
          "/download-template",
          ({ set }) => {
            const buffer = ClassroomService.generateTemplate();
            set.headers["Content-Type"] =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            set.headers["Content-Disposition"] =
              "attachment; filename=classroom_template.xlsx";
            return buffer;
          },
          {
            detail: {
              summary: "Download classroom upload template",
            },
          },
        ),
  );
