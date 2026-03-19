import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateCountrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().length(2, 'Code must be exactly 2 characters'),
  flag: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { name, code, flag } = updateCountrySchema.parse(body);

    const country = await prisma.country.update({
      where: { id },
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
    console.error('Error updating country:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update country' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await prisma.country.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Country deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete country' } },
      { status: 500 }
    );
  }
}