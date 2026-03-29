import { t, type UnwrapSchema } from "elysia";

export const ProgramModel = {
	programBody: t.Object({
		name: t.String(),
		departmentId: t.Optional(t.String()),
		levelId: t.Optional(t.String()),
	}),
	programPartial: t.Partial(
		t.Object({
			name: t.String(),
			departmentId: t.Optional(t.String()),
			levelId: t.Optional(t.String()),
		}),
	),
} as const;

export type ProgramModel = {
	[k in keyof typeof ProgramModel]: UnwrapSchema<typeof ProgramModel[k]>;
};

export const programInclude = {
	department: true,
	level: true,
} as const;