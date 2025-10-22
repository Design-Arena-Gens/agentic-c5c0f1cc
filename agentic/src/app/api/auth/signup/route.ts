import { NextResponse } from 'next/server';
import { z } from 'zod';

import { signAuthToken, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['EMPLOYER', 'SEEKER']),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  preferredRole: z.string().optional(),
  preferredLocation: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = signupSchema.parse(json);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        skills: data.skills ?? [],
        experience: data.experience,
        preferredRole: data.preferredRole,
        preferredLocation: data.preferredLocation,
      },
    });

    const token = signAuthToken({ userId: user.id, role: user.role });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        experience: user.experience,
        preferredRole: user.preferredRole,
        preferredLocation: user.preferredLocation,
      },
    });
  } catch (error) {
    console.error('Signup error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
