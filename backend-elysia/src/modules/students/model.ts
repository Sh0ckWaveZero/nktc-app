import { t, type UnwrapSchema } from "elysia";

export const StudentModel = {
	listQuery: t.Object({
		skip: t.Optional(t.String()),
		take: t.Optional(t.String()),
	}),
	searchQuery: t.Object({
		q: t.Optional(t.String()),
		classroomId: t.Optional(t.String()),
		departmentId: t.Optional(t.String()),
		programId: t.Optional(t.String()),
	}),
	uploadBody: t.Object({
		file: t.String(),
	}),
} as const;

export type StudentModel = {
	[k in keyof typeof StudentModel]: UnwrapSchema<typeof StudentModel[k]>;
};

export const studentInclude = {
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
	classroom: { include: { program: true, department: true, level: true } },
	program: true,
	department: true,
	level: true,
} as const;