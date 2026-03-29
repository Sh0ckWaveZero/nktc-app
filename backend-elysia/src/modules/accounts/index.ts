import { Elysia } from "elysia";
import { AccountService } from "./service";
import { AccountModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const accounts = new Elysia({ prefix: "/accounts" })
	.use(authGuard)
	.guard({
		detail: {
			tags: ["Accounts"],
			security: [{ BearerAuth: [] }],
		},
	}, (app) =>
		app
			.post(
				"/",
				async ({ body, set }) => {
					const account = await AccountService.create(body);
					set.status = 201;
					return account;
				},
				{
					body: AccountModel.accountBody,
					detail: {
						summary: "Create a new account",
					},
				},
			)
			.get("/", async () => {
				return AccountService.getAll();
			}, {
				detail: {
					summary: "Get all accounts",
				},
			})
			.get("/:id", async ({ params: { id } }) => {
				return AccountService.getById(id);
			}, {
				detail: {
					summary: "Get account by ID",
				},
			})
			.patch(
				"/:id",
				async ({ params: { id }, body }) => {
					return AccountService.update(id, body);
				},
				{
					body: AccountModel.accountBody,
					detail: {
						summary: "Update an account",
					},
				},
			)
			.delete("/:id", async ({ params: { id }, set }) => {
				await AccountService.delete(id);
				set.status = 204;
				return null;
			}, {
				detail: {
					summary: "Delete an account",
				},
			}),
	);