import { t, type UnwrapSchema } from "elysia";

export const AuthModel = {
	login: t.Object({
		username: t.String(),
		password: t.String(),
	}),
	register: t.Object({
		username: t.String(),
		password: t.String(),
		email: t.Optional(t.String()),
		role: t.Optional(t.String()),
	}),
	refresh: t.Object({
		refreshToken: t.String(),
	}),
	updatePassword: t.Object({
		currentPassword: t.String(),
		newPassword: t.String(),
		confirmPassword: t.String(),
	}),
} as const;

export type AuthModel = {
	[k in keyof typeof AuthModel]: UnwrapSchema<typeof AuthModel[k]>;
};