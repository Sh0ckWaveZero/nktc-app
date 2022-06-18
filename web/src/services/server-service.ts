import httpClient from "../utils/http-client";
import {GetSession, SignUp} from "../models/auth-model";

type signProps = {
  username: string;
  password: string;
}

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL_LOCAL_API || 'http://localhost:3000/api';

export const sigIn = async (user: signProps): Promise<any> => {
  const {data: response} = await httpClient.post(
    `auth/login`,
    user,
    {
      baseURL: 'http://localhost:3000/api',
    }
  );

  return response;
}

export const signUp = async (user: signProps): Promise<SignUp> => {
  const response = await httpClient.post<SignUp>("/authen/register", user);

  return response.data;
};

export async function signOut() {
  const response = await httpClient.get(`/auth/sign-out`, {
    baseURL: apiUrl,
  });

  return response.data;
}

// @ts-ignore
export const getSession = async (): Promise<GetSession> => {
  try {
    const response = await httpClient.get(`/auth/session`, {
      baseURL: 'http://localhost:3000/api',
    });

    return response.data;
  } catch (error) {
    console.log('error', error)
  }
};
