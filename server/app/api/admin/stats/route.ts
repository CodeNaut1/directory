import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verify authentication and admin/moderator role
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Check if user is admin or moderator
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return NextResponse.json(
        { success: false, error: { message: 'Forbidden: Admin or moderator access required' } },
        { status: 403 }
      );
    }

    // Get current date and date from 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch all stats in parallel
    const [
      totalProjects,
      publishedProjects,
      pendingApprovals,
      totalUsers,
      newSubmissionsThisWeek,
      totalCategories,
      totalCountries,
      totalTags,
    ] = await Promise.all([
      // Total projects
      prisma.project.count(),

      // Published projects
      prisma.project.count({
        where: { published: true },
      }),

      // Pending approvals (not published)
      prisma.project.count({
        where: { published: false },
      }),

      // Total users
      prisma.user.count(),

      // New submissions this week
      prisma.project.count({
        where: {
          createdAt: {
            gte: oneWeekAgo,
          },
        },
      }),

      // Total categories
      prisma.category.count(),

      // Total countries
      prisma.country.count(),

      // Total tags
      prisma.tag.count(),
    ]);

    const stats = {
      totalProjects,
      publishedProjects,
      pendingApprovals,
      totalUsers,
      newSubmissionsThisWeek,
      totalCategories,
      totalCountries,
      totalTags,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch admin statistics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}