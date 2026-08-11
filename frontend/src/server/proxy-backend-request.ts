import { NextRequest, NextResponse } from 'next/server';

import { backendServerConfig } from '@/server/backend';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const buildForwardHeaders = (request: NextRequest): Headers => {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  headers.set('x-forwarded-host', request.headers.get('host') || '');
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));
  return headers;
};

const buildResponseHeaders = (response: Response): Headers => {
  const headers = new Headers();
  const responseHeaders = response.headers as Headers & { getSetCookie?: () => string[] };
  const setCookies = responseHeaders.getSetCookie?.() || [];

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie' && setCookies.length) {
      return;
    }
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.append(key, value);
    }
  });

  setCookies.forEach((cookie) => headers.append('set-cookie', cookie));

  return headers;
};

/** ส่งคำขอจาก Next.js ไปยัง Elysia โดยรักษา cookie และ Set-Cookie สำหรับ Better Auth */
export const proxyBackendRequest = async (request: NextRequest, path: string[]): Promise<NextResponse> => {
  const cleanPath = path.filter(Boolean);

  if (!cleanPath.length || cleanPath.some((segment) => segment.includes('..'))) {
    return NextResponse.json({ message: 'Invalid backend path' }, { status: 400 });
  }

  const targetUrl = backendServerConfig.url(cleanPath.join('/'), request.nextUrl.search);
  const requestInit: RequestInit & { duplex?: 'half' } = {
    headers: buildForwardHeaders(request),
    method: request.method,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    requestInit.body = request.body;
    requestInit.duplex = 'half';
  }

  try {
    const response = await fetch(targetUrl, requestInit);
    return new NextResponse(response.body, {
      headers: buildResponseHeaders(response),
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error('Backend proxy error:', error);
    return NextResponse.json({ message: 'Backend service unavailable' }, { status: 502 });
  }
};
