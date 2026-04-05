import { t, type UnwrapSchema } from "elysia";

export const ClassroomModel = {
	uploadBody: t.Object({
		file: t.String(),
	}),
} as const;

export type ClassroomModel = {
	[k in keyof typeof ClassroomModel]: UnwrapSchema<typeof ClassroomModel[k]>;
};

export const classroomInclude = {
	program: true,
	department: true,
	level: true,
} as const;