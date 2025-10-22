import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const employerPassword = await bcrypt.hash('employer123', 10);
  const seekerPassword = await bcrypt.hash('seeker123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const employer = await prisma.user.create({
    data: {
      name: 'Acme Corp',
      email: 'employer@acme.com',
      passwordHash: employerPassword,
      role: UserRole.EMPLOYER,
      skills: [],
      preferredLocation: 'Remote',
    },
  });

  const seeker = await prisma.user.create({
    data: {
      name: 'Jane Developer',
      email: 'jane@example.com',
      passwordHash: seekerPassword,
      role: UserRole.SEEKER,
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: '5 years building web applications',
      preferredRole: 'Frontend Engineer',
      preferredLocation: 'Remote',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Frontend Engineer',
      description:
        'Lead the development of our customer-facing web applications using React and TypeScript.',
      skills: ['React', 'TypeScript', 'UX'],
      location: 'Remote',
      salary: '$130k - $160k',
      employerId: employer.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Fullstack Node.js Engineer',
      description:
        'Build API integrations and internal tools using Node.js, Express, and PostgreSQL.',
      skills: ['Node.js', 'Express', 'SQL'],
      location: 'New York, NY',
      salary: '$120k - $150k',
      employerId: employer.id,
    },
  });

  await prisma.application.create({
    data: {
      jobId: job1.id,
      seekerId: seeker.id,
      message: 'I have 5 years of experience shipping production React apps.',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      seekerId: seeker.id,
      message: 'Experienced with Node.js and looking for new challenges.',
    },
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
