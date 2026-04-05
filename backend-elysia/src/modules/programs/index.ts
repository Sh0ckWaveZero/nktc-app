import { Elysia } from "elysia";
import { ProgramService } from "./service";
import { ProgramModel } from "./model";
import { authGuard } from "@/middleware/auth";
import { ForbiddenError } from "@/libs/errors";

export const programs = new Elysia({ prefix: "/programs" })
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
            return ProgramService.getAll();
          },
          {
            detail: {
              summary: "Get all academic programs",
            },
          },
        )
        .get(
          "/download-template",
          ({ set }) => {
            const buffer = ProgramService.generateTemplate();
            set.headers["Content-Type"] =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            set.headers["Content-Disposition"] =
              "attachment; filename=program_template.xlsx";
            return buffer;
          },
          {
            detail: {
              summary: "Download program upload template",
            },
          },
        )
        .post(
          "/upload",
          async ({ body, user }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }
            const { file } = body as ProgramModel["uploadBody"];
            return ProgramService.importFromXLSX(file, (user as any).sub);
          },
          {
            body: ProgramModel.uploadBody,
            detail: {
              summary: "Upload academic program batch via XLSX",
            },
          },
        )
        .get(
          "/:id",
          async ({ params: { id } }) => {
            return ProgramService.getById(id);
          },
          {
            detail: {
              summary: "Get academic program by ID",
            },
          },
        )
        .post(
          "/",
          async ({ body, user, set }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }
            const program = await ProgramService.create({
              ...(body as ProgramModel["programBody"]),
              createdBy: (user as any).sub,
            });
            set.status = 201;
            return program;
          },
          {
            body: ProgramModel.programBody,
            detail: {
              summary: "Create a new academic program",
            },
          },
        )
        .patch(
          "/:id",
          async ({ params: { id }, body, user }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }
            return ProgramService.update(id, {
              ...(body as ProgramModel["programPartial"]),
              updatedBy: (user as any).sub,
            });
          },
          {
            body: ProgramModel.programPartial,
            detail: {
              summary: "Update an academic program",
            },
          },
        )
        .delete(
          "/:id",
          async ({ params: { id }, user }) => {
            if ((user as any).roles !== "Admin") {
              throw new ForbiddenError();
            }
            await ProgramService.delete(id);
            return { success: true, message: "Program deleted" };
          },
          {
            detail: {
              summary: "Delete an academic program",
            },
          },
        ),
  );
