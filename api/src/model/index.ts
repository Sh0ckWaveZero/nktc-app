import Elysia from 'elysia';
import { loginBody } from './loginBody';
import { updatePasswordBody } from './updatePasswordBody';

export const AuthModel = new Elysia().model({
  'auth.updatePassword': updatePasswordBody,
  'auth.login': loginBody,
});
