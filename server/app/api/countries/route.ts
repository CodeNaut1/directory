import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { getAllCountries } from '@/lib/services/country.service';

/**
 * Get all countries
 * GET /api/countries
 */
export const GET = createGetHandler(async (req: NextRequest) => {
  const countries = await getAllCountries();
  return NextResponse.json(successResponse(countries));
});

