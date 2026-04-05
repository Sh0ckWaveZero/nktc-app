import { t, type UnwrapSchema } from "elysia";

const studentItem = t.Object({
	id: t.String(),
	studentId: t.String(),
	classroom: t.Optional(t.Object({
		id: t.String(),
	}, { additionalProperties: true })),
}, { additionalProperties: true });

export const BadnessModel = {
	badnessBody: t.Object({
		studentId: t.String(),
		studentKey: t.Optional(t.String()),
		classroomId: t.Optional(t.String()),
		badnessScore: t.Number(),
		badnessDetail: t.Optional(t.String()),
		image: t.Optional(t.String()),
		badDate: t.Optional(t.String()),
		createdBy: t.Optional(t.String()),
		updatedBy: t.Optional(t.String()),
	}),
	badnessGroupBody: t.Object({
		students: t.Array(studentItem),
		badnessScore: t.Union([t.Number(), t.String()]),
		badnessDetail: t.Optional(t.String()),
		image: t.Optional(t.String()),
		badDate: t.Optional(t.String()),
		createdBy: t.Optional(t.String()),
		updatedBy: t.Optional(t.String()),
	}),
	queryBody: t.Object({
		skip: t.Optional(t.String()),
		take: t.Optional(t.String()),
	}),
} as const;

export type BadnessModel = {
	[k in keyof typeof BadnessModel]: UnwrapSchema<typeof BadnessModel[k]>;
};