import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TalentAssess Showcase Database Seeding...');

  // 1. Clean existing records
  await prisma.candidateOnboarding.deleteMany();
  await prisma.kraepelinResult.deleteMany();
  await prisma.papiResult.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobVacancy.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordCandidate = await bcrypt.hash('kandidat123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@talentassess.com',
      password: hashedPasswordAdmin,
      name: 'Sarah Jenkins (Lead HR Recruiter)',
      role: 'HR_ADMIN',
      phone: '+62 811-2345-6789',
    },
  });

  const candidate = await prisma.user.create({
    data: {
      email: 'kandidat@example.com',
      password: hashedPasswordCandidate,
      name: 'Dimas Prasetyo',
      role: 'CANDIDATE',
      phone: '+62 812-9876-5432',
      nik: '3171012304950001',
    },
  });

  console.log('✅ Created Demo Users:');
  console.log('   - Admin: admin@talentassess.com / admin123');
  console.log('   - Candidate: kandidat@example.com / kandidat123');

  // 3. Create Job Vacancies
  const v1 = await prisma.jobVacancy.create({
    data: {
      title: 'Senior Software Engineer (Distributed Systems)',
      department: 'Engineering & Technology',
      plantLocation: 'Plant 1 - Digital Hub Jakarta',
      type: 'Full-Time',
      description: 'Bertanggung jawab dalam merancang arsitektur microservices terdistribusi, mengoptimalkan database high-throughput, dan memimpin delivery platform psikometri korporasi.',
      requirements: 'Pengalaman 4+ tahun dalam Node.js/TypeScript, Go/Laravel, arsitektur event-driven, Redis, dan optimasi query database.',
      status: 'OPEN',
    },
  });

  const v2 = await prisma.jobVacancy.create({
    data: {
      title: 'Industrial Automation & Robotics Engineer',
      department: 'Manufacturing Operations',
      plantLocation: 'Plant 2 - Karawang Industrial Estate',
      type: 'Full-Time',
      description: 'Mengelola otomatisasi lini perakitan, sistem PLC, SCADA, dan pemeliharaan preventif sensor IoT industri.',
      requirements: 'S1 Teknik Elektro / Mekatronika, familiar dengan PLC Siemens/Omron, pemahaman keselamatan kerja K3 manufaktur.',
      status: 'OPEN',
    },
  });

  const v3 = await prisma.jobVacancy.create({
    data: {
      title: 'Talent Acquisition & Assessment Specialist',
      department: 'Human Resources',
      plantLocation: 'Corporate HQ - Jakarta Selatan',
      type: 'Full-Time',
      description: 'Memimpin proses rekrutmen massal end-to-end, interpretasi hasil psikometri kandidat, dan digital onboarding.',
      requirements: 'S1 Psikologi / MSDM, memiliki Surat Izin Praktik Psikologi (SIPP) merupakan nilai tambah, mahir interpretasi Kraepelin & PAPI.',
      status: 'OPEN',
    },
  });

  console.log('✅ Created 3 Job Vacancies.');

  // 4. Create an Initial Application for Dimas on Vacancy 1
  const application = await prisma.application.create({
    data: {
      userId: candidate.id,
      vacancyId: v1.id,
      registrationNo: 'VAC-26/11/00001',
      status: 'SUBMITTED',
      testToken: 'DEMO-TOKEN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
  });

  console.log(`✅ Created Application ${application.registrationNo} for Dimas Prasetyo.`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
