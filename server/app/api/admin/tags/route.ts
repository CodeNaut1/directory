import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
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
    const { name } = createTagSchema.parse(body);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { message: 'A tag with this name already exists' } },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create tag' } },
      { status: 500 }
    );
  }
}