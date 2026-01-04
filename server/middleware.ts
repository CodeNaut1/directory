import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCorsHeaders } from './lib/auth/middleware';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const response = NextResponse.next();

  // Add CORS headers to all responses
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};