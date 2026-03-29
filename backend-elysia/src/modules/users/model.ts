import { t, type UnwrapSchema } from "elysia";

export const UserModel = {
	updatePassword: t.Object({
		currentPassword: t.String(),
		newPassword: t.String(),
		confirmPassword: t.String(),
	}),
	updatePasswordById: t.Object({
		newPassword: t.String(),
		confirmPassword: t.String(),
	}),
	auditLogsQuery: t.Object({
		skip: t.Optional(t.String()),
		take: t.Optional(t.String()),
	}),
} as const;

export type UserModel = {
	[k in keyof typeof UserModel]: UnwrapSchema<typeof UserModel[k]>;
};