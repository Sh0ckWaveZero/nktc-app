import { DEFAULT } from '@/common/constants';
import Elysia, { t } from 'elysia';

const updatePasswordBody = t.Object({
  oldPassword: t.String({
    minLength: DEFAULT.PASSWORD_MIN_LENGTH,
    maxLength: DEFAULT.PASSWORD_MAX_LENGTH,
  }),
  newPassword: t.String({
    minLength: DEFAULT.PASSWORD_MIN_LENGTH,
    maxLength: DEFAULT.PASSWORD_MAX_LENGTH,
  }),
});

const loginBody = t.Object({
  username: t.String({
    minLength: DEFAULT.USER_NAME_MIN_LENGTH,
    maxLength: DEFAULT.USER_NAME_MAX_LENGTH,
  }),
  password: t.String({
    minLength: DEFAULT.PASSWORD_MIN_LENGTH,
    maxLength: DEFAULT.PASSWORD_MAX_LENGTH,
  }),
});

export const AuthModel = new Elysia().model({
  'auth.updatePassword': updatePasswordBody,
  'auth.login': loginBody,
});