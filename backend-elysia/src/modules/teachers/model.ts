import { t, type UnwrapSchema } from "elysia";

export const TeacherModel = {
	searchQuery: t.Object({
		q: t.Optional(t.String()),
	}),
	classroomsBody: t.Object({
		classrooms: t.Array(t.String()),
	}),
} as const;

export type TeacherModel = {
	[k in keyof typeof TeacherModel]: UnwrapSchema<typeof TeacherModel[k]>;
};

export const teacherInclude = {
	user: {
		include: {
			account: {
				select: {
					id: true,
					title: true,
					firstName: true,
					lastName: true,
					avatar: true,
					idCard: true,
					birthDate: true,
					phone: true,
				},
			},
		},
	},
	department: true,
	classrooms: true,
} as const;