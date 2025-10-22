import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getAuthUser } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

const createApplicationSchema = z.object({
  jobId: z.string().uuid(),
  message: z.string().min(1).max(1000),
});

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role === 'SEEKER') {
      const applications = await prisma.application.findMany({
        where: { seekerId: auth.userId },
        include: {
          job: {
            include: {
              employer: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ applications });
    }

    if (auth.role === 'EMPLOYER' || auth.role === 'ADMIN') {
      const applications = await prisma.application.findMany({
        where: auth.role === 'ADMIN' ? undefined : { job: { employerId: auth.userId } },
        include: {
          job: true,
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
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ applications });
    }

    return NextResponse.json({ error: 'Unsupported role' }, { status: 403 });
  } catch (error) {
    console.error('Applications GET error', error);
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request);

    if (!auth || auth.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const data = createApplicationSchema.parse(json);

    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      include: { employer: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const alreadyApplied = await prisma.application.findFirst({
      where: {
        jobId: data.jobId,
        seekerId: auth.userId,
      },
    });

    if (alreadyApplied) {
      return NextResponse.json({ error: 'You already applied to this job' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        jobId: data.jobId,
        seekerId: auth.userId,
        message: data.message,
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Applications POST error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
