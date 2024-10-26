import Elysia, { t } from 'elysia';

const updatePasswordBody = t.Object({
  oldPassword: t.String(),
  newPassword: t.String(),
});

const loginBody = t.Object({
  username: t.String(),
  password: t.String(),
});

export const AuthModel = new Elysia().model({
  'auth.updatePassword': updatePasswordBody,
  'auth.login': loginBody,
});
