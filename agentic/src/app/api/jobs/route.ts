import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-helpers';

const createJobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  skills: z.array(z.string()).optional(),
  location: z.string().min(2),
  salary: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const location = searchParams.get('location') || undefined;
    const seekerId = searchParams.get('seekerId') || undefined;

    const where: Prisma.JobWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (location) {
      where.location = { contains: location };
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          include: {
            seeker: {
              select: {
                id: true,
                name: true,
                email: true,
                skills: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let seekerSkills: string[] | null = null;
    if (seekerId) {
      const seeker = await prisma.user.findUnique({ where: { id: seekerId } });
      if (seeker && Array.isArray(seeker.skills)) {
        seekerSkills = seeker.skills.filter((skill): skill is string => typeof skill === 'string');
      }
    }

    const jobsWithMatch = jobs.map((job) => {
      const jobSkills = Array.isArray(job.skills)
        ? job.skills.filter((skill): skill is string => typeof skill === 'string')
        : [];

      const overlapCount = seekerSkills
        ? jobSkills.filter((skill) => seekerSkills!.includes(skill)).length
        : 0;

      const matchScore = seekerSkills ? overlapCount / Math.max(jobSkills.length, 1) : null;

      return {
        ...job,
        matchScore,
        skills: jobSkills,
      };
    });

    return NextResponse.json({ jobs: jobsWithMatch });
  } catch (error) {
    console.error('Jobs GET error', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request);
    if (!auth || (auth.role !== 'EMPLOYER' && auth.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const data = createJobSchema.parse(json);

    const job = await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        skills: data.skills ?? [],
        location: data.location,
        salary: data.salary,
        employerId: auth.userId,
      },
    });

    const seekers = await prisma.user.findMany({
      where: { role: 'SEEKER' },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
      },
    });

    const jobSkills = (data.skills ?? []).map((skill) => skill.toLowerCase());
    const matchingSeekers = seekers.filter((seeker) => {
      if (!Array.isArray(seeker.skills)) return false;
      const normalized = seeker.skills
        .filter((skill): skill is string => typeof skill === 'string')
        .map((skill) => skill.toLowerCase());
      return jobSkills.some((skill) => normalized.includes(skill));
    });

    return NextResponse.json({ job, matches: matchingSeekers });
  } catch (error) {
    console.error('Jobs POST error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
