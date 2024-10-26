import { t } from 'elysia';

const loginBody = t.Object({
  username: t.String(),
  password: t.String(),
});

export { loginBody };
