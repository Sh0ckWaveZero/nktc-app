import { Elysia } from "elysia";
import { SystemSettingsService } from "./service";
import { authGuard } from "@/middleware/auth";

export const systemSettings = new Elysia({ prefix: "/system-settings" })
  .get("/", async () => {
    const data = await SystemSettingsService.getSettings();
    return { success: true, data };
  }, {
    detail: {
      tags: ["System-Settings"],
      summary: "Get system and institution settings",
    },
  })
  .use(authGuard)
  .guard({
    detail: {
      tags: ["System-Settings"],
      security: [{ BearerAuth: [] }],
    },
  }, (app) =>
    app.put("/", async ({ body, user }) => {
      const data = await SystemSettingsService.updateSettings(body as any, user?.id);
      return { success: true, message: "อัปเดตการตั้งค่าระบบเรียบร้อยแล้ว", data };
    }, {
      detail: {
        summary: "Update system settings (Admin only)",
      },
    })
  );
