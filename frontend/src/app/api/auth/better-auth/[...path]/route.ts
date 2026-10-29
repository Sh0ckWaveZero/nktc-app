import { NextRequest } from 'next/server';

import { proxyBackendRequest } from '@/server/proxy-backend-request';

const proxyBetterAuthRequest = async (request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => {
  const { path } = await params;
  return proxyBackendRequest(request, ['auth', 'better-auth', ...path]);
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export const DELETE = proxyBetterAuthRequest;
export const GET = proxyBetterAuthRequest;
export const HEAD = proxyBetterAuthRequest;
export const PATCH = proxyBetterAuthRequest;
export const POST = proxyBetterAuthRequest;
export const PUT = proxyBetterAuthRequest;
