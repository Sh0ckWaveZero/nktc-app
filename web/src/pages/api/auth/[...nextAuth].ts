import cookie from "cookie";
import httpClient from "../../../utils/http-client";

// @ts-ignore
import { NextApiRequest, NextApiResponse } from "next";
import { clearCookie, setCookie } from "@/utils/cookies";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const action = req.query["nextAuth"][0];
  if (req.method === 'POST' && action === "login") {
    return login(req, res);
  } else if (req.method === 'GET' && action === "signOut") {
    return signOut(req, res);
  } else if (req.method === 'GET' && action === "session") {
    return getSession(req, res);
  } else {
    return res
      .status(405)
      .end(`Error: HTTP ${req.method} is not supported for ${req.url}`);
  }
}

const login = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  console.log('req.body', req.body);
  try {
    const response = await httpClient.post(`/auth/login`, req.body, {
      baseURL: process.env.NEXT_PUBLIC_BASE_URL_API,
    });
    const { token } = response.data;
    setCookie(res, 'access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(401).json({ massage: error.response.data });
  }
}

const signOut = (req: NextApiRequest, res: NextApiResponse<any>) => {
  clearCookie(res, 'access_token');
  res.json({ message: "Sign out success" });
}

const getSession = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const accessToken = cookies['access_token'];
    if (accessToken) {
      const { data } = await httpClient.get(`/auth/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      res.json(data);
    } else {
      res.json({ message: "No access token" });
    }
  } catch (error: any) {
    res.status(401).json({ massage: error.response.data });
  }
}
