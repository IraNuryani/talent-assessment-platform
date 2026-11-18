import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { KraepelinEngine } from './services/kraepelin.service.js';
import { PapiEngine } from './services/papi.service.js';
import { ApplicationService } from './services/application.service.js';
import { OnboardingService } from './services/onboarding.service.js';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

// Register Plugins
await app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

await app.register(jwt, {
  secret: 'talentassess-super-secret-jwt-key-2026',
});

// Authentication Middleware Helper
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Token tidak valid atau telah kadaluarsa' });
  }
});

// ─────────────────────────────────────────────
// 1. AUTH ROUTES
// ─────────────────────────────────────────────

app.post('/api/auth/register', async (request, reply) => {
  const { email, password, name, phone, nik } = request.body as any;

  if (!email || !password || !name) {
    return reply.status(400).send({ error: 'Email, password, dan nama lengkap wajib diisi.' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.status(400).send({ error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      nik: nik || null,
      role: 'CANDIDATE',
    },
  });

  const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name });
  return reply.send({
    message: 'Registrasi berhasil',
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

app.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as any;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.status(401).send({ error: 'Email atau kata sandi tidak cocok.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return reply.status(401).send({ error: 'Email atau kata sandi tidak cocok.' });
  }

  const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name });
  return reply.send({
    message: 'Login berhasil',
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

app.get('/api/auth/me', { preHandler: [app.authenticate as any] }, async (request: any, reply) => {
  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, email: true, name: true, role: true, phone: true, nik: true },
  });
  return reply.send(user);
});

// ─────────────────────────────────────────────
// 2. JOB VACANCIES ROUTES
// ─────────────────────────────────────────────

app.get('/api/vacancies', async () => {
  return prisma.jobVacancy.findMany({
    orderBy: { createdAt: 'desc' },
  });
});

app.get('/api/vacancies/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const vacancy = await prisma.jobVacancy.findUnique({ where: { id } });
  if (!vacancy) return reply.status(404).send({ error: 'Lowongan tidak ditemukan' });
  return reply.send(vacancy);
});

// ─────────────────────────────────────────────
// 3. APPLICATION & ATS PIPELINE ROUTES
// ─────────────────────────────────────────────

app.post('/api/applications/apply', { preHandler: [app.authenticate as any] }, async (request: any, reply) => {
  const { vacancyId } = request.body as { vacancyId: string };
  try {
    const result = await ApplicationService.apply(request.user.id, vacancyId);
    return reply.send({ message: 'Lamaran Anda berhasil dikirimkan!', application: result });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.get('/api/applications/my', { preHandler: [app.authenticate as any] }, async (request: any, reply) => {
  const list = await ApplicationService.getCandidateApplications(request.user.id);
  return reply.send(list);
});

app.get('/api/applications/all', { preHandler: [app.authenticate as any] }, async (request: any, reply) => {
  // Hanya HR yang diizinkan melihat semua lamaran
  const list = await ApplicationService.getAllApplications();
  return reply.send(list);
});

app.get('/api/applications/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const application = await ApplicationService.getById(id);
  if (!application) return reply.status(404).send({ error: 'Lamaran tidak ditemukan' });
  return reply.send(application);
});

app.patch('/api/applications/:id/status', { preHandler: [app.authenticate as any] }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as { status: string };
  try {
    const updated = await ApplicationService.updateStatus(id, status);
    return reply.send({ message: `Status berhasil diubah menjadi ${status}`, application: updated });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// 4. PSYCHOMETRIC TEST ENGINES
// ─────────────────────────────────────────────

// Kraepelin Submit
app.post('/api/psychotest/kraepelin/submit', async (request, reply) => {
  const { applicationId, columnStats } = request.body as { applicationId: string; columnStats: any[] };

  if (!applicationId || !Array.isArray(columnStats)) {
    return reply.status(400).send({ error: 'Invalid payload: applicationId & columnStats required.' });
  }

  // Hitung dengan engine matematis
  const calculated = KraepelinEngine.calculate(columnStats);

  // Simpan hasil ke database
  const result = await prisma.kraepelinResult.upsert({
    where: { applicationId },
    create: {
      applicationId,
      totalAnswered: calculated.totalAnswered,
      totalCorrect: calculated.totalCorrect,
      totalWrong: calculated.totalWrong,
      accuracyRate: calculated.accuracyRate,
      workCapacity: calculated.workCapacity,
      consistencyScore: calculated.consistencyScore,
      fatigueIndex: calculated.fatigueIndex,
      pattern: calculated.pattern,
      columnStatsJson: JSON.stringify(columnStats),
    },
    update: {
      totalAnswered: calculated.totalAnswered,
      totalCorrect: calculated.totalCorrect,
      totalWrong: calculated.totalWrong,
      accuracyRate: calculated.accuracyRate,
      workCapacity: calculated.workCapacity,
      consistencyScore: calculated.consistencyScore,
      fatigueIndex: calculated.fatigueIndex,
      pattern: calculated.pattern,
      columnStatsJson: JSON.stringify(columnStats),
    },
  });

  return reply.send({
    message: 'Hasil tes Kraepelin berhasil dikalkulasi dan disimpan',
    metrics: calculated,
    workCurve: columnStats,
  });
});

// PAPI-Kostick Questions
app.get('/api/psychotest/papi/questions', async () => {
  return PapiEngine.getSampleQuestions();
});

// PAPI-Kostick Submit
app.post('/api/psychotest/papi/submit', async (request, reply) => {
  const { applicationId, answers } = request.body as { applicationId: string; answers: any[] };

  if (!applicationId || !Array.isArray(answers)) {
    return reply.status(400).send({ error: 'Invalid payload: applicationId & answers required.' });
  }

  const evaluation = PapiEngine.evaluate(answers);

  const result = await prisma.papiResult.upsert({
    where: { applicationId },
    create: {
      applicationId,
      rawScoresJson: JSON.stringify(evaluation.rawScores),
      radarDataJson: JSON.stringify({ labels: evaluation.radarLabels, values: evaluation.radarValues }),
      diagnosticSummaryJson: JSON.stringify(evaluation.diagnosticSummary),
    },
    update: {
      rawScoresJson: JSON.stringify(evaluation.rawScores),
      radarDataJson: JSON.stringify({ labels: evaluation.radarLabels, values: evaluation.radarValues }),
      diagnosticSummaryJson: JSON.stringify(evaluation.diagnosticSummary),
    },
  });

  return reply.send({
    message: 'Hasil tes PAPI-Kostick berhasil dievaluasi',
    evaluation,
  });
});

// ─────────────────────────────────────────────
// 5. DIGITAL ONBOARDING ROUTES
// ─────────────────────────────────────────────

app.get('/api/onboarding/:applicationId', async (request, reply) => {
  const { applicationId } = request.params as { applicationId: string };
  try {
    const data = await OnboardingService.getOrInit(applicationId);
    return reply.send(data);
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.post('/api/onboarding/:applicationId/draft', async (request, reply) => {
  const { applicationId } = request.params as { applicationId: string };
  try {
    const updated = await OnboardingService.saveDraft(applicationId, request.body);
    return reply.send({ message: 'Draft onboarding berhasil disimpan', onboarding: updated });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.post('/api/onboarding/:applicationId/submit', async (request, reply) => {
  const { applicationId } = request.params as { applicationId: string };
  const payload = request.body as { signatureBase64: string; signedCity?: string };
  try {
    const updated = await OnboardingService.submitFinal(applicationId, payload);
    return reply.send({ message: 'Formulir data diri berhasil dikirimkan!', onboarding: updated });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.post('/api/onboarding/:applicationId/verify', async (request, reply) => {
  const { applicationId } = request.params as { applicationId: string };
  try {
    const verified = await OnboardingService.verifyByHr(applicationId);
    return reply.send({ message: 'Formulir onboarding telah diverifikasi oleh HR!', onboarding: verified });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

const start = async () => {
  try {
    const PORT = 4000;
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 TalentAssess Showcase Backend running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
