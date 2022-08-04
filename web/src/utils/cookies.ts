import {CookieSerializeOptions, serialize} from "cookie";

// @ts-ignore
import { NextApiResponse } from 'next'

/**
 * This sets `cookie` using the `res` object
 */
export const setCookie = (res: NextApiResponse, name: string, value: unknown, options: CookieSerializeOptions = {}) => {
  const stringValue = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (options.maxAge) {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge = options.maxAge / 1000
  }
  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}

export const clearCookie = (res: NextApiResponse, name: string, path = '/') => {
  res.setHeader('Set-Cookie', serialize(name, '', { maxAge: 0, path }))
}
