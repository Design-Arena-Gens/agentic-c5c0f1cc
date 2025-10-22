import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getAuthUser } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  preferredRole: z.string().optional(),
  preferredLocation: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        skills: true,
        experience: true,
        preferredRole: true,
        preferredLocation: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthUser(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const data = updateProfileSchema.parse(json);

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name: data.name,
        skills: data.skills,
        experience: data.experience,
        preferredRole: data.preferredRole,
        preferredLocation: data.preferredLocation,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        skills: true,
        experience: true,
        preferredRole: true,
        preferredLocation: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Profile PUT error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
