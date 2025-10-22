import { NextRequest, NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthUser(request);

    if (!auth || (auth.role !== 'EMPLOYER' && auth.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: auth.role === 'ADMIN' ? undefined : { employerId: auth.userId },
      include: {
        applications: {
          include: {
            seeker: {
              select: {
                id: true,
                name: true,
                email: true,
                skills: true,
                experience: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = jobs.map((job) => ({
      ...job,
      skills: Array.isArray(job.skills)
        ? job.skills.filter((skill): skill is string => typeof skill === 'string')
        : [],
      applications: job.applications.map((application) => ({
        ...application,
        seeker: {
          ...application.seeker,
          skills: Array.isArray(application.seeker.skills)
            ? application.seeker.skills.filter((skill): skill is string => typeof skill === 'string')
            : [],
        },
      })),
    }));

    return NextResponse.json({ jobs: serialized });
  } catch (error) {
    console.error('Employer jobs error', error);
    return NextResponse.json({ error: 'Failed to load employer jobs' }, { status: 500 });
  }
}
