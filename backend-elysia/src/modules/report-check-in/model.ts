import { t, type UnwrapSchema } from "elysia";

export const ReportCheckInModel = {
	teacherClassroomQuery: t.Object({
		date: t.Optional(t.String({ description: "Filter by date YYYY-MM-DD" })),
	}),
	checkInBody: t.Object({
		teacherId: t.String(),
		classroomId: t.String(),
		checkInDate: t.String(),
		checkInTime: t.Optional(t.String()),
		present: t.Optional(t.Array(t.String())),
		absent: t.Optional(t.Array(t.String())),
		late: t.Optional(t.Array(t.String())),
		leave: t.Optional(t.Array(t.String())),
		internship: t.Optional(t.Array(t.String())),
	}),
	updateBody: t.Object({
		present: t.Optional(t.Array(t.String())),
		absent: t.Optional(t.Array(t.String())),
		late: t.Optional(t.Array(t.String())),
		leave: t.Optional(t.Array(t.String())),
		internship: t.Optional(t.Array(t.String())),
		status: t.Optional(t.Nullable(t.String())),
		updatedBy: t.Optional(t.Nullable(t.String())),
		updateBy: t.Optional(t.Nullable(t.String())),
	}),
} as const;

export type ReportCheckInModel = {
	[k in keyof typeof ReportCheckInModel]: UnwrapSchema<typeof ReportCheckInModel[k]>;
};