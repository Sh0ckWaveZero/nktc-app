import { DEFAULT } from '@/common/constants';
import Elysia, { t } from 'elysia';

const updatePasswordBody = t.Object({
  oldPassword: t.String(),
  newPassword: t.String(),
});

const loginBody = t.Object({
  username: t.String({ minLength: 3 }),
  password: t.String({
    minLength: DEFAULT.PASSWORD_MIN_LENGTH,
    maxLength: DEFAULT.PASSWORD_MAX_LENGTH,
  }),
});

export const AuthModel = new Elysia().model({
  'auth.updatePassword': updatePasswordBody,
  'auth.login': loginBody,
});
