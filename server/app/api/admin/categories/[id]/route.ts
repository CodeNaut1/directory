import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
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
    const { name, description } = updateCategorySchema.parse(body);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update category' } },
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

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Category deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete category' } },
      { status: 500 }
    );
  }
}