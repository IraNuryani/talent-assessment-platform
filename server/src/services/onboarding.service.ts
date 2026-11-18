import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OnboardingService {
  /**
   * Mengambil atau membuat inisialisasi formulir onboarding untuk pelamar yang berstatus HIRED
   */
  public static async getOrInit(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        vacancy: true,
        onboarding: true,
      },
    });

    if (!application) {
      throw new Error('Data lamaran tidak ditemukan');
    }

    if (application.status !== 'HIRED') {
      throw new Error('Formulir onboarding hanya dapat diakses oleh kandidat berstatus DITERIMA (HIRED)');
    }

    let onboarding = application.onboarding;

    if (!onboarding) {
      onboarding = await prisma.candidateOnboarding.create({
        data: {
          applicationId: application.id,
          status: 'DRAFT',
          currentStep: 1,
          signedCity: 'Jakarta',
          signedDate: new Date().toISOString().split('T')[0],
          // Default prefill from user profile
          nickname: application.user.name.split(' ')[0],
          birthPlace: 'Jakarta',
          birthDate: '1996-08-17',
          gender: 'L',
          maritalStatus: 'Belum Menikah',
          religion: 'Islam',
          ktpAddress: 'Jl. Jenderal Sudirman No. 45, Jakarta Selatan',
          domicileAddress: 'Jl. Jenderal Sudirman No. 45, Jakarta Selatan',
          residenceStatus: 'Rumah',
          heightCm: 172,
          weightKg: 65,
          dailyVehicle: 'Sepeda Motor',
          distanceToOfficeKm: 8.5,
          emergencyContactName: 'Budi Prasetyo',
          emergencyContactRelation: 'Ayah',
          emergencyContactPhone: '+62 812-3344-5566',
          familyDataJson: JSON.stringify([
            { relation: 'Ayah', name: 'Budi Prasetyo', gender: 'L', birth: 'Semarang, 12-05-1965', job: 'Wiraswasta', phone: '+62 812-3344-5566' },
            { relation: 'Ibu', name: 'Siti Aminah', gender: 'P', birth: 'Solo, 24-09-1970', job: 'Ibu Rumah Tangga', phone: '-' },
          ]),
          educationDataJson: JSON.stringify([
            { level: 'S1', institution: 'Universitas Indonesia', major: 'Teknik Informatika', yearIn: 2014, yearOut: 2018, gpa: '3.75' },
          ]),
          workHistoryDataJson: JSON.stringify([
            { company: 'PT Inovasi Digital Nusantara', position: 'Software Engineer', period: '2019 - 2023', lastSalary: '15.000.000', reasonQuit: 'Pengembangan Karir' },
          ]),
        },
      });
    }

    return {
      application,
      onboarding,
    };
  }

  /**
   * Menyimpan draft langkah onboarding
   */
  public static async saveDraft(applicationId: string, data: any) {
    const onboarding = await prisma.candidateOnboarding.findUnique({
      where: { applicationId },
    });

    if (!onboarding) {
      throw new Error('Formulir onboarding belum diinisialisasi');
    }

    if (onboarding.status === 'VERIFIED') {
      throw new Error('Formulir telah diverifikasi oleh HR dan tidak dapat diubah lagi');
    }

    return prisma.candidateOnboarding.update({
      where: { applicationId },
      data: {
        currentStep: data.currentStep ?? onboarding.currentStep,
        nickname: data.nickname ?? onboarding.nickname,
        birthPlace: data.birthPlace ?? onboarding.birthPlace,
        birthDate: data.birthDate ?? onboarding.birthDate,
        gender: data.gender ?? onboarding.gender,
        maritalStatus: data.maritalStatus ?? onboarding.maritalStatus,
        religion: data.religion ?? onboarding.religion,
        ktpAddress: data.ktpAddress ?? onboarding.ktpAddress,
        domicileAddress: data.domicileAddress ?? onboarding.domicileAddress,
        residenceStatus: data.residenceStatus ?? onboarding.residenceStatus,
        familyDataJson: data.familyData ? JSON.stringify(data.familyData) : onboarding.familyDataJson,
        educationDataJson: data.educationData ? JSON.stringify(data.educationData) : onboarding.educationDataJson,
        workHistoryDataJson: data.workHistoryData ? JSON.stringify(data.workHistoryData) : onboarding.workHistoryDataJson,
        heightCm: data.heightCm ? Number(data.heightCm) : onboarding.heightCm,
        weightKg: data.weightKg ? Number(data.weightKg) : onboarding.weightKg,
        dailyVehicle: data.dailyVehicle ?? onboarding.dailyVehicle,
        distanceToOfficeKm: data.distanceToOfficeKm ? Number(data.distanceToOfficeKm) : onboarding.distanceToOfficeKm,
        emergencyContactName: data.emergencyContactName ?? onboarding.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone ?? onboarding.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation ?? onboarding.emergencyContactRelation,
        signatureBase64: data.signatureBase64 ?? onboarding.signatureBase64,
        truthDeclared: data.truthDeclared ?? onboarding.truthDeclared,
        signedCity: data.signedCity ?? onboarding.signedCity,
        signedDate: data.signedDate ?? onboarding.signedDate,
      },
    });
  }

  /**
   * Submit final formulir onboarding beserta tanda tangan digital
   */
  public static async submitFinal(applicationId: string, payload: { signatureBase64: string; signedCity?: string }) {
    if (!payload.signatureBase64) {
      throw new Error('Tanda tangan digital wajib dibubuhkan sebelum mengirimkan formulir.');
    }

    return prisma.candidateOnboarding.update({
      where: { applicationId },
      data: {
        signatureBase64: payload.signatureBase64,
        truthDeclared: true,
        signedCity: payload.signedCity || 'Jakarta',
        signedDate: new Date().toISOString().split('T')[0],
        status: 'SUBMITTED',
      },
    });
  }

  /**
   * Verifikasi oleh HR
   */
  public static async verifyByHr(applicationId: string) {
    return prisma.candidateOnboarding.update({
      where: { applicationId },
      data: {
        status: 'VERIFIED',
      },
    });
  }
}
