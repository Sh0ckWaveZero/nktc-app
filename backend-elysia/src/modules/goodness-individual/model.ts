import { t, type UnwrapSchema } from "elysia";

export const GoodnessModel = {
	goodnessBody: t.Object({
		studentId: t.String(),
		classroomId: t.String(),
		goodnessScore: t.Number(),
		goodnessDetail: t.Optional(t.String()),
		image: t.Optional(t.String()),
		goodDate: t.Optional(t.String()),
	}),
	queryBody: t.Object({
		skip: t.Optional(t.String()),
		take: t.Optional(t.String()),
	}),
} as const;

export type GoodnessModel = {
	[k in keyof typeof GoodnessModel]: UnwrapSchema<typeof GoodnessModel[k]>;
};