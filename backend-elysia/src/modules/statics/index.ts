import { Elysia } from "elysia";
import { StaticsService } from "./service";
import { authGuard } from "@/middleware/auth";

export const statics = new Elysia({ prefix: "/statics" })
	.use(authGuard)
	.get("/:folder/:filename", async ({ params: { folder, filename }, set }) => {
		try {
			const buffer = await StaticsService.getFile(folder, filename);
			set.headers["Content-Type"] = StaticsService.getContentType(filename);
			set.headers["Content-Disposition"] = `inline; filename="${filename}"`;
			return buffer;
		} catch (error) {
			set.status = 404;
			return { success: false, message: "File not found" };
		}
	})
	.get("/:folder/:filename/download", async ({ params: { folder, filename }, set }) => {
		try {
			const buffer = await StaticsService.getFile(folder, filename);
			set.headers["Content-Type"] = StaticsService.getContentType(filename);
			set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;
			return buffer;
		} catch (error) {
			set.status = 404;
			return { success: false, message: "File not found" };
		}
	});