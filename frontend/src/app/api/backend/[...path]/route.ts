import { NextRequest } from 'next/server';

import { proxyBackendRequest } from '@/server/proxy-backend-request';

const proxyRequest = async (request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => {
  const { path } = await params;
  return proxyBackendRequest(request, path);
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
