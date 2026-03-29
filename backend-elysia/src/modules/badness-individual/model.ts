import { t, type UnwrapSchema } from "elysia";

export const BadnessModel = {
	badnessBody: t.Object({
		studentId: t.String(),
		classroomId: t.String(),
		badnessScore: t.Number(),
		badnessDetail: t.Optional(t.String()),
		image: t.Optional(t.String()),
		badDate: t.Optional(t.String()),
	}),
	queryBody: t.Object({
		skip: t.Optional(t.String()),
		take: t.Optional(t.String()),
	}),
} as const;

export type BadnessModel = {
	[k in keyof typeof BadnessModel]: UnwrapSchema<typeof BadnessModel[k]>;
};