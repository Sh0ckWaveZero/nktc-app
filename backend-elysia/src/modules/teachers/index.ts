import { Elysia } from "elysia";
import { TeacherService } from "./service";
import { TeacherModel } from "./model";
import { authGuard } from "@/middleware/auth";
import { ForbiddenError } from "@/libs/errors";

export const teachers = new Elysia({ prefix: "/teachers" })
  .use(authGuard)
  .guard(
    {
      detail: {
        tags: ["Teachers"],
        security: [{ BearerAuth: [] }],
      },
    },
    (app) =>
      app
        .get(
          "/",
          async ({ query }) => {
            return TeacherService.search(query);
          },
          {
            query: TeacherModel.searchQuery,
            detail: {
              summary: "Search teachers",
              description: "Search for teachers by name or property",
            },
          },
        )
        .get(
          "/download-template",
          ({ set }) => {
            const buffer = TeacherService.generateTemplate();
            set.headers["Content-Type"] =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            set.headers["Content-Disposition"] =
              "attachment; filename=teacher_template.xlsx";
            return buffer;
          },
          {
            detail: {
              summary: "Download teacher upload template",
            },
          },
        )
        .post(
          "/upload",
          async ({ body, user, set }) => {
            if ((user as any)?.roles !== "Admin") {
              throw new ForbiddenError();
            }

            const { file } = body as TeacherModel["uploadBody"];
            return TeacherService.importFromXLSX(file, (user as any).sub);
          },
          {
            body: TeacherModel.uploadBody,
            detail: {
              summary: "Upload teacher batch via XLSX",
            },
          },
        )
        .post(
          "/",
          async ({ body, set }) => {
            const teacher = await TeacherService.create(body);
            set.status = 201;
            return teacher;
          },
          {
            body: TeacherModel.createBody,
            detail: {
              summary: "Create a new teacher",
            },
          },
        )
        .put(
          "/:id",
          async ({ params: { id }, body }) => {
            return TeacherService.update(id, body);
          },
          {
            body: TeacherModel.updateBody,
            detail: {
              summary: "Update a teacher info",
            },
          },
        )
        .delete(
          "/:id",
          async ({ params: { id }, set }) => {
            await TeacherService.delete(id);
            set.status = 204;
            return null;
          },
          {
            detail: {
              summary: "Delete a teacher",
            },
          },
        )
        .put(
          "/:id/profile",
          async ({ params: { id }, body }) => {
            return TeacherService.updateProfile(id, body);
          },
          {
            body: TeacherModel.updateBody,
            detail: {
              summary: "Update teacher profile detail",
            },
          },
        )
        .put(
          "/:id/classrooms",
          async ({ params: { id }, body }) => {
            const { classrooms } = body as { classrooms: string[] };
            return TeacherService.updateClassrooms(id, classrooms);
          },
          {
            body: TeacherModel.classroomsBody,
            detail: {
              summary: "Assign classrooms to teacher",
            },
          },
        )
        .get(
          "/:id/students",
          async ({ params: { id } }) => {
            return TeacherService.getStudents(id);
          },
          {
            detail: {
              summary: "Get students assigned to teacher",
            },
          },
        )
        .get(
          "/:id/classrooms-and-students",
          async ({ params: { id } }) => {
            return TeacherService.getClassroomsWithStudents(id);
          },
          {
            detail: {
              summary: "Get classrooms and students for teacher",
            },
          },
        ),
  );
