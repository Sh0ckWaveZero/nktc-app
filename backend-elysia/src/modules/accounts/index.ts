import { Elysia } from "elysia";
import { AccountService } from "./service";
import { AccountModel } from "./model";
import { authGuard } from "@/middleware/auth";

export const accounts = new Elysia({ prefix: "/accounts" })
	.use(authGuard)
	.post(
		"/",
		async ({ body, set }) => {
			const account = await AccountService.create(body);
			set.status = 201;
			return account;
		},
		{ body: AccountModel.accountBody },
	)
	.get("/", async () => {
		return AccountService.getAll();
	})
	.get("/:id", async ({ params: { id } }) => {
		return AccountService.getById(id);
	})
	.patch(
		"/:id",
		async ({ params: { id }, body }) => {
			return AccountService.update(id, body);
		},
		{ body: AccountModel.accountBody },
	)
	.delete("/:id", async ({ params: { id }, set }) => {
		await AccountService.delete(id);
		set.status = 204;
		return null;
	});