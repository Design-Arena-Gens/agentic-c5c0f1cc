import { NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthUser(request);

    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [users, jobs, applications] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.findMany({
        include: {
          employer: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.findMany({
        include: {
          job: {
            select: { id: true, title: true },
          },
          seeker: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      counts: {
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalApplications: applications.length,
      },
      users,
      jobs,
      applications,
    });
  } catch (error) {
    console.error('Admin overview error', error);
    return NextResponse.json({ error: 'Failed to load admin overview' }, { status: 500 });
  }
}
