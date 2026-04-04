import { t, type UnwrapSchema } from "elysia";

export const ActivityCheckInModel = {
	activityBody: t.Object({
		teacherId: t.String(),
		classroomId: t.String(),
		checkInDate: t.String(),
		checkInTime: t.Optional(t.String()),
		present: t.Optional(t.Array(t.String())),
		absent: t.Optional(t.Array(t.String())),
	}),
	updateBody: t.Object({
		present: t.Optional(t.Array(t.String())),
		absent: t.Optional(t.Array(t.String())),
		status: t.Optional(t.Nullable(t.String())),
		updatedBy: t.Optional(t.Nullable(t.String())),
		updateBy: t.Optional(t.Nullable(t.String())),
	}),
} as const;

export type ActivityCheckInModel = {
	[k in keyof typeof ActivityCheckInModel]: UnwrapSchema<typeof ActivityCheckInModel[k]>;
};