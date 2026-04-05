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

  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
};

const proxyRequest = async (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await params;

  if (!path.length || path.some((segment) => segment.includes('..'))) {
    return NextResponse.json(
      {
        message: 'Invalid backend path',
      },
      {
        status: 400,
      },
    );
  }

  const targetUrl = backendServerConfig.url(path.join('/'), request.nextUrl.search);
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

    return NextResponse.json(
      {
        message: 'Backend service unavailable',
      },
      {
        status: 502,
      },
    );
  }
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export const DELETE = proxyRequest;
export const GET = proxyRequest;
export const HEAD = proxyRequest;
export const PATCH = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
