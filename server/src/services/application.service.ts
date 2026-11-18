import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ApplicationService {
  /**
   * Membuat lamaran baru untuk lowongan
   */
  public static async apply(userId: string, vacancyId: string) {
    // Periksa apakah sudah pernah melamar
    const existing = await prisma.application.findFirst({
      where: { userId, vacancyId },
    });

    if (existing) {
      throw new Error('Anda sudah pernah mengirimkan lamaran untuk lowongan ini.');
    }

    const count = await prisma.application.count();
    const regNo = `VAC-26/11/${String(count + 1).padStart(5, '0')}`;
    const testToken = `TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return prisma.application.create({
      data: {
        userId,
        vacancyId,
        registrationNo: regNo,
        status: 'SUBMITTED',
        testToken,
      },
      include: {
        vacancy: true,
      },
    });
  }

  /**
   * Mengambil daftar lamaran kandidat
   */
  public static async getCandidateApplications(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      include: {
        vacancy: true,
        kraepelinResult: true,
        papiResult: true,
        onboarding: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Mengambil seluruh lamaran untuk HR Recruiter Dashboard
   */
  public static async getAllApplications() {
    return prisma.application.findMany({
      include: {
        user: true,
        vacancy: true,
        kraepelinResult: true,
        papiResult: true,
        onboarding: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Memperbarui status lamaran
   */
  public static async updateStatus(applicationId: string, status: string) {
    const validStatuses = ['SUBMITTED', 'SCREENED', 'PSYCHOTEST_INVITED', 'PSYCHOTEST_PASSED', 'HIRED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}`);
    }

    return prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: true,
        vacancy: true,
      },
    });
  }

  /**
   * Mengambil detail lamaran
   */
  public static async getById(applicationId: string) {
    return prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        vacancy: true,
        kraepelinResult: true,
        papiResult: true,
        onboarding: true,
      },
    });
  }
}
