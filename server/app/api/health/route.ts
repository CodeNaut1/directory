import { NextRequest, NextResponse } from 'next/server';
import { successResponse } from '@/lib/utils/api-response';
import { createGetHandler } from '@/lib/utils/api-handler';

/**
 * Health check endpoint
 * GET /api/health
 */
export const GET = createGetHandler(async (req: NextRequest) => {
  return NextResponse.json(
    successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
});

