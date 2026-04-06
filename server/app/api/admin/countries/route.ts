import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const createCountrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().length(2, 'Code must be exactly 2 characters').toUpperCase(),
  flag: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { user } = authResult;
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return NextResponse.json(
        { success: false, error: { message: 'Forbidden' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, code, flag } = createCountrySchema.parse(body);

    const existing = await prisma.country.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { message: 'A country with this code already exists' } },
        { status: 400 }
      );
    }

    const country = await prisma.country.create({
      data: {
        name,
        code: code.toUpperCase(),
        flag: flag || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: country,
    });
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create country' } },
      { status: 500 }
    );
  }
}