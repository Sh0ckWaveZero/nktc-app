import { t, type UnwrapSchema } from "elysia";

export const AccountModel = {
	accountBody: t.Object({
		title: t.Optional(t.String()),
		firstName: t.Optional(t.String()),
		lastName: t.Optional(t.String()),
		idCard: t.Optional(t.String()),
		birthDate: t.Optional(t.String()),
		phone: t.Optional(t.String()),
		address: t.Optional(t.String()),
		subDistrict: t.Optional(t.String()),
		district: t.Optional(t.String()),
		province: t.Optional(t.String()),
		postCode: t.Optional(t.String()),
		avatar: t.Optional(t.String()),
		userId: t.Optional(t.String()),
	}),
} as const;

export type AccountModel = {
	[k in keyof typeof AccountModel]: UnwrapSchema<typeof AccountModel[k]>;
};