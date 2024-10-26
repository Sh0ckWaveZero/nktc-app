import { t } from 'elysia';

const updatePasswordBody = t.Object({
  oldPassword: t.String(),
  newPassword: t.String(),
});

export { updatePasswordBody };
