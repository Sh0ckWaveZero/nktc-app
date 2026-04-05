import { Elysia } from "elysia";
import { DepartmentService } from "./service";
import { authGuard } from "@/middleware/auth";
import { DepartmentModel } from "./model";
import { ForbiddenError } from "@/libs/errors";

export const departments = new Elysia({ prefix: "/departments" })
  .use(authGuard)
  .guard(
    {
      detail: {
        tags: ["Reference-Data"],
        security: [{ BearerAuth: [] }],
      },
    },
    (app) =>
      app
        .get(
          "/",
          async () => {
            return DepartmentService.getAll();
          },
          {
            detail: {
              summary: "Get all academic departments",
            },
          },
        )
        .get(
          "/download-template",
          ({ set }) => {
            const buffer = DepartmentService.generateTemplate();
            set.headers["Content-Type"] =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            set.headers["Content-Disposition"] =
              "attachment; filename=department_template.xlsx";
            return buffer;
          },
          {
            detail: {
              summary: "Download department upload template",
            },
          },
        )
        .post(
          "/upload",
          async ({ body, user }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }

            const { file } = body as DepartmentModel["uploadBody"];
            return DepartmentService.importFromXLSX(file, (user as any).sub);
          },
          {
            body: DepartmentModel.uploadBody,
            detail: {
              summary: "Upload department batch via XLSX",
            },
          },
        )
        .get(
          "/:id",
          async ({ params: { id } }) => {
            return DepartmentService.getById(id);
          },
          {
            detail: {
              summary: "Get academic department by ID",
            },
          },
        )
        .post(
          "/",
          async ({ body, user, set }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }

            const department = await DepartmentService.create({
              ...(body as DepartmentModel["departmentBody"]),
              createdBy: (user as any).sub,
            });
            set.status = 201;
            return department;
          },
          {
            body: DepartmentModel.departmentBody,
            detail: {
              summary: "Create a new academic department",
            },
          },
        )
        .patch(
          "/:id",
          async ({ params: { id }, body, user }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }

            return DepartmentService.update(id, {
              ...(body as DepartmentModel["departmentPartial"]),
              updatedBy: (user as any).sub,
            });
          },
          {
            body: DepartmentModel.departmentPartial,
            detail: {
              summary: "Update an academic department",
            },
          },
        )
        .delete(
          "/:id",
          async ({ params: { id }, user }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }

            await DepartmentService.delete(id);
            return { success: true, message: "Department deleted" };
          },
          {
            detail: {
              summary: "Delete an academic department",
            },
          },
        ),
  );
