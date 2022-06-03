import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken';
import getConfig from 'next/config';
import { apiHandler } from '@/helpers/api';
import prisma from '@/lib/prisma';
const { serverRuntimeConfig } = getConfig();

// users in JSON file for simplicity, store in a db for production applications
const handler = (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      return authenticate();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  async function authenticate() {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        username,
        password
      },
    });

    if (!user) throw 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';

    // create a jwt token that is valid for 7 days
    const accessToken = jwt.sign({ sub: user.id }, serverRuntimeConfig.secret, { expiresIn: '7d' });

    // return basic user details and token
    return res.status(200).json({
      id: user.id,
      username: user.username,
      firstName: 'John',
      lastName: 'Doe',
      accessToken: accessToken
    });
  }
}

export default apiHandler(handler);