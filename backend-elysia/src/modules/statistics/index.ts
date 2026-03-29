import { Elysia, t } from "elysia";
import { StatisticsService } from "./service";
import { authGuard } from "@/middleware/auth";

export const statistics = new Elysia({ prefix: "/statistics" })
	.use(authGuard)
	.get(
		"/term",
		async ({ query }) => {
			return StatisticsService.getTermStats(query);
		},
		{
			query: t.Object({
				startDate: t.Optional(t.String()),
				endDate: t.Optional(t.String()),
				academicYear: t.Optional(t.String()),
				departmentId: t.Optional(t.String()),
				programId: t.Optional(t.String()),
			}),
		},
	);