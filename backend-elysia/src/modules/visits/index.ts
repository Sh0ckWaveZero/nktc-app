import { Elysia, t } from "elysia";
import { VisitService } from "./service";
import { authGuard } from "@/middleware/auth";

export const visits = new Elysia({ prefix: "/visits" })
	.use(authGuard)
	.get(
		"/get-visit/all",
		async ({ query }) => {
			return VisitService.getAll(query);
		},
		{
			query: t.Object({
				classroomId: t.Optional(t.String()),
				academicYear: t.Optional(t.String()),
				visitNo: t.Optional(t.String()),
			}),
		},
	);