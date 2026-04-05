import { Elysia } from "elysia";
import { StaticsService } from "./service";
import { authGuard } from "@/middleware/auth";

export const statics = new Elysia({ prefix: "/statics" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Statics"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app
			.get("/:folder/:filename", async ({ params: { folder, filename }, set }) => {
				const buffer = await StaticsService.getFile(folder, filename);
				set.headers["Content-Type"] = StaticsService.getContentType(filename);
				set.headers["Content-Disposition"] = `inline; filename="${filename}"`;
				return buffer;
			}, {
				detail: {
					summary: "View static file",
				},
			})
			.get("/:folder/:filename/download", async ({ params: { folder, filename }, set }) => {
				const buffer = await StaticsService.getFile(folder, filename);
				set.headers["Content-Type"] = StaticsService.getContentType(filename);
				set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;
				return buffer;
			}, {
				detail: {
					summary: "Download static file",
				},
			}),
	);
