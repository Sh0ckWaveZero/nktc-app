import {UserData} from "./user-model";

export interface SignIn {
  result: string;
  token: string;
  error?: string;
  user: UserData;
}

export interface SignUp {
  result: string;
  error?: string;
}

export interface GetSession {
  result: string;
  error?: string;
  user?: UserData;
}

