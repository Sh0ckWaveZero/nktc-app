import cookie from "cookie";
import httpClient from "../../../utils/http-client";

// @ts-ignore
import {NextApiRequest, NextApiResponse} from "next";
import {clearCookie, setCookie} from "@/utils/cookies";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const action = req.query["nextAuth"][0];
  if (req.method === 'POST' && action === "login") {
    return login(req, res);
  } else if (req.method === 'GET' && action === "signout") {
    return signout(req, res);
  } else if (req.method === 'GET' && action === "session") {
    return getSession(req, res);
  } else {
    return res
      .status(405)
      .end(`Error: HTTP ${req.method} is not supported for ${req.url}`);
  }
}

async function login(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const response = await httpClient.post(`/auth/login`, req.body, {
      baseURL: 'http://localhost:3001',
    });
    const {token} = response.data;
    setCookie(res, 'access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(401).json({massage: error.response.data});
  }
}

function signout(req: NextApiRequest, res: NextApiResponse<any>) {
  clearCookie(res, 'access_token');
  res.json({result: "ok"});
}

async function getSession(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    console.log('cookies', cookies);
    const accessToken = cookies['access_token'];
    console.log('accessToken', accessToken);
    if (accessToken) {
      const response = await httpClient.get(`/auth/users`, {
        headers: {Authorization: `Bearer ${accessToken}`},
      });
      console.log('response', response);
      res.json(response.data);
    } else {
      res.json({result: "nok"});
    }
  } catch (error: any) {
    res.json({result: "nok"});
  }
}
