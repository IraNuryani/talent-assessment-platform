<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SignaturePad from '../components/SignaturePad.vue';
import {
  User,
  Users,
  GraduationCap,
  Briefcase,
  HeartPulse,
  PenTool,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  FileCheck,
  Building,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const applicationId = route.params.applicationId as string;

const currentStep = ref(1);
const isLoading = ref(true);
const isSaving = ref(false);
const message = ref('');
const error = ref('');

const application = ref<any>(null);
const onboarding = ref<any>({
  nickname: '',
  birthPlace: '',
  birthDate: '',
  gender: 'L',
  maritalStatus: 'Belum Menikah',
  religion: 'Islam',
  ktpAddress: '',
  domicileAddress: '',
  residenceStatus: 'Rumah',
  heightCm: 170,
  weightKg: 65,
  dailyVehicle: 'Sepeda Motor',
  distanceToOfficeKm: 10,
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',
  familyData: [],
  educationData: [],
  workHistoryData: [],
  signatureBase64: '',
  truthDeclared: false,
  status: 'DRAFT',
});

const steps = [
  { num: 1, title: 'Identitas & Domisili', icon: User },
  { num: 2, title: 'Susunan Keluarga', icon: Users },
  { num: 3, title: 'Pendidikan & Keahlian', icon: GraduationCap },
  { num: 4, title: 'Pengalaman Kerja', icon: Briefcase },
  { num: 5, title: 'Kesehatan & Mobilitas', icon: HeartPulse },
  { num: 6, title: 'Tanda Tangan & Pernyataan', icon: PenTool },
];

onMounted(async () => {
  try {
    const res = await fetch(`/api/onboarding/${applicationId}`);
    const data = await res.json();
    if (res.ok) {
      application.value = data.application;
      const ob = data.onboarding;
      onboarding.value = {
        ...ob,
        familyData: ob.familyDataJson ? JSON.parse(ob.familyDataJson) : [],
        educationData: ob.educationDataJson ? JSON.parse(ob.educationDataJson) : [],
        workHistoryData: ob.workHistoryDataJson ? JSON.parse(ob.workHistoryDataJson) : [],
      };
      if (ob.currentStep) currentStep.value = ob.currentStep;
    } else {
      error.value = data.error || 'Gagal memuat onboarding';
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
});

async function saveDraft() {
  isSaving.value = true;
  message.value = '';
  error.value = '';

  try {
    const res = await fetch(`/api/onboarding/${applicationId}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...onboarding.value,
        currentStep: currentStep.value,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      message.value = 'Progres draft formulir berhasil disimpan otomatis.';
      setTimeout(() => (message.value = ''), 3000);
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isSaving.value = false;
  }
}

function handleSignatureSave(base64: string) {
  onboarding.value.signatureBase64 = base64;
}

async function submitFinal() {
  if (!onboarding.value.signatureBase64) {
    error.value = 'Tanda tangan digital wajib dibubuhkan pada canvas sebelum mengirimkan formulir.';
    return;
  }

  if (!onboarding.value.truthDeclared) {
    error.value = 'Anda harus menyetujui pernyataan kebenaran data.';
    return;
  }

  isSaving.value = true;
  error.value = '';

  try {
    const res = await fetch(`/api/onboarding/${applicationId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signatureBase64: onboarding.value.signatureBase64,
        signedCity: 'Jakarta',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      onboarding.value.status = 'SUBMITTED';
      message.value = 'Formulir data diri calon karyawan berhasil dikirimkan ke HRD!';
    } else {
      error.value = data.error || 'Gagal mengirimkan formulir';
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isSaving.value = false;
  }
}

function nextStep() {
  if (currentStep.value < 6) {
    currentStep.value++;
    saveDraft();
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <!-- Top Bar -->
    <div class="flex items-center justify-between">
      <router-link to="/my-applications" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft class="w-4 h-4" /> Kembali ke Lamaran Saya
      </router-link>

      <span class="text-xs font-bold px-2.5 py-1 rounded-md" :class="onboarding.status === 'SUBMITTED' || onboarding.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
        Status: {{ onboarding.status }}
      </span>
    </div>

    <!-- Onboarding Header Banner -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <FileCheck class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Formulir Resmi F-HRD-002</span>
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Formulir Data Diri Calon Karyawan
          </h1>
          <p class="text-xs text-slate-500">
            Kandidat Diterima: <strong class="text-slate-800">{{ application?.user?.name }}</strong> untuk posisi <strong class="text-brand-700">{{ application?.vacancy?.title }}</strong>
          </p>
        </div>
      </div>

      <!-- 6-Stage Stepper Navigation Bar -->
      <div class="pt-4 border-t border-slate-100">
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            v-for="st in steps"
            :key="st.num"
            @click="currentStep = st.num"
            :disabled="onboarding.status === 'SUBMITTED' || onboarding.status === 'VERIFIED'"
            :class="[
              'p-2.5 rounded-xl border text-left transition-all',
              currentStep === st.num
                ? 'bg-brand-50 border-brand-500 text-brand-900 font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            ]"
          >
            <div class="flex items-center gap-1.5 text-xs">
              <component :is="st.icon" class="w-3.5 h-3.5" />
              <span class="text-[11px] truncate">Tahap {{ st.num }}</span>
            </div>
            <span class="text-[10px] block truncate font-medium mt-0.5">{{ st.title }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Alert notifications -->
    <div v-if="message" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
      <CheckCircle2 class="w-4 h-4 text-emerald-600" /> {{ message }}
    </div>
    <div v-if="error" class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
      {{ error }}
    </div>

    <!-- Form Wizard Body Container -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <!-- ─── TAHAP 1: IDENTITAS & DOMISILI ─── -->
      <div v-if="currentStep === 1" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <User class="w-4 h-4 text-brand-600" /> 1. Data Identitas Pribadi & Domisili
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Panggilan</label>
            <input v-model="onboarding.nickname" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Nama Panggilan" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tempat & Tanggal Lahir</label>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="onboarding.birthPlace" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Kota Lahir" />
              <input v-model="onboarding.birthDate" type="date" class="w-full p-2.5 border border-slate-300 rounded-xl" />
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
            <select v-model="onboarding.gender" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Status Pernikahan</label>
            <select v-model="onboarding.maritalStatus" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white">
              <option value="Belum Menikah">Belum Menikah</option>
              <option value="Menikah">Menikah</option>
              <option value="Duda/Janda">Duda / Janda</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">Alamat Sesuai KTP</label>
            <textarea v-model="onboarding.ktpAddress" rows="2" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Alamat lengkap sesuai identitas KTP"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">Alamat Tempat Tinggal Saat Ini (Domisili)</label>
            <textarea v-model="onboarding.domicileAddress" rows="2" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Alamat domisili saat ini"></textarea>
          </div>
        </div>
      </div>

      <!-- ─── TAHAP 2: SUSUNAN KELUARGA ─── -->
      <div v-else-if="currentStep === 2" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Users class="w-4 h-4 text-brand-600" /> 2. Susunan Anggota Keluarga
        </h3>

        <div class="overflow-x-auto text-xs">
          <table class="w-full text-left border-collapse border border-slate-200 rounded-xl">
            <thead class="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th class="p-2 border">Hubungan</th>
                <th class="p-2 border">Nama Lengkap</th>
                <th class="p-2 border">Tempat/Tgl Lahir</th>
                <th class="p-2 border">Pekerjaan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fam, idx) in onboarding.familyData" :key="idx" class="border">
                <td class="p-2 border font-bold">{{ fam.relation }}</td>
                <td class="p-2 border">{{ fam.name }}</td>
                <td class="p-2 border">{{ fam.birth }}</td>
                <td class="p-2 border">{{ fam.job }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── TAHAP 3: PENDIDIKAN & KEAHLIAN ─── -->
      <div v-else-if="currentStep === 3" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <GraduationCap class="w-4 h-4 text-brand-600" /> 3. Riwayat Pendidikan & Pelatihan
        </h3>

        <div class="space-y-3 text-xs">
          <div v-for="(edu, idx) in onboarding.educationData" :key="idx" class="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div class="flex items-center justify-between font-bold text-slate-800">
              <span>{{ edu.level }} - {{ edu.institution }}</span>
              <span class="text-brand-600">IPK: {{ edu.gpa }}</span>
            </div>
            <p class="text-slate-500 mt-1">Jurusan: {{ edu.major }} (Tahun {{ edu.yearIn }} - {{ edu.yearOut }})</p>
          </div>
        </div>
      </div>

      <!-- ─── TAHAP 4: PENGALAMAN KERJA ─── -->
      <div v-else-if="currentStep === 4" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Briefcase class="w-4 h-4 text-brand-600" /> 4. Riwayat Pengalaman Kerja Terdahulu
        </h3>

        <div class="space-y-3 text-xs">
          <div v-for="(work, idx) in onboarding.workHistoryData" :key="idx" class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div class="flex items-center justify-between font-bold text-slate-800">
              <span>{{ work.position }} di {{ work.company }}</span>
              <span class="text-emerald-700">Rp {{ work.lastSalary }}</span>
            </div>
            <p class="text-slate-500">Periode: {{ work.period }}</p>
            <p class="text-slate-600 italic">Alasan Berhenti: {{ work.reasonQuit }}</p>
          </div>
        </div>
      </div>

      <!-- ─── TAHAP 5: KESEHATAN & MOBILITAS ─── -->
      <div v-else-if="currentStep === 5" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <HeartPulse class="w-4 h-4 text-brand-600" /> 5. Data Kesehatan & Mobilitas Kerja
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tinggi Badan (cm)</label>
            <input v-model="onboarding.heightCm" type="number" class="w-full p-2.5 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Berat Badan (kg)</label>
            <input v-model="onboarding.weightKg" type="number" class="w-full p-2.5 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kendaraan Harian yang Digunakan</label>
            <input v-model="onboarding.dailyVehicle" class="w-full p-2.5 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Estimasi Jarak Rumah ke Kantor/Plant (KM)</label>
            <input v-model="onboarding.distanceToOfficeKm" type="number" class="w-full p-2.5 border border-slate-300 rounded-xl" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Kontak Darurat</label>
            <input v-model="onboarding.emergencyContactName" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Nama kerabat" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">No. Telp / HP Kontak Darurat</label>
            <input v-model="onboarding.emergencyContactPhone" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="+62 81..." />
          </div>
        </div>
      </div>

      <!-- ─── TAHAP 6: TANDA TANGAN DIGITAL & PERNYATAAN ─── -->
      <div v-else-if="currentStep === 6" class="space-y-6">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <PenTool class="w-4 h-4 text-brand-600" /> 6. Pernyataan Kebenaran Data & Tanda Tangan Digital
        </h3>

        <!-- Affirmation Checkbox -->
        <label class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 cursor-pointer">
          <input
            v-model="onboarding.truthDeclared"
            type="checkbox"
            :disabled="onboarding.status === 'SUBMITTED' || onboarding.status === 'VERIFIED'"
            class="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300"
          />
          <div class="leading-relaxed">
            <span class="font-bold block">Pernyataan Hukum Kebenaran Data:</span>
            Saya menyatakan dengan sesungguhnya bahwa seluruh data dan keterangan yang saya isikan pada formulir data diri ini adalah benar dan dapat dipertanggungjawabkan secara hukum. Apabila di kemudian hari ditemukan ketidakbenaran, saya bersedia menerima sanksi pembatalan penerimaan kerja.
          </div>
        </label>

        <!-- Digital Signature Canvas Component -->
        <div>
          <h4 class="text-xs font-bold text-slate-800 mb-2">Bubuhkan Tanda Tangan Digital Resmi:</h4>
          
          <div v-if="onboarding.status === 'SUBMITTED' || onboarding.status === 'VERIFIED'" class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
            <p class="text-xs font-semibold text-emerald-800">Tanda tangan digital Anda telah tersimpan dan terkunci:</p>
            <img v-if="onboarding.signatureBase64" :src="onboarding.signatureBase64" alt="Digital Signature" class="h-24 mx-auto border border-slate-300 bg-white p-2 rounded-lg" />
            <p class="text-[11px] text-slate-500 font-mono">Ditandatangani di {{ onboarding.signedCity }}, {{ onboarding.signedDate }}</p>
          </div>

          <SignaturePad v-else @save="handleSignatureSave" />
        </div>
      </div>

      <!-- Navigation & Action Buttons Footer -->
      <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" /> Sebelumnya
        </button>
        <div v-else></div>

        <div class="flex items-center gap-2">
          <button
            v-if="onboarding.status === 'DRAFT'"
            @click="saveDraft"
            :disabled="isSaving"
            class="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Save class="w-3.5 h-3.5" /> Simpan Draft
          </button>

          <button
            v-if="currentStep < 6"
            @click="nextStep"
            class="px-5 py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            Selanjutnya <ArrowRight class="w-3.5 h-3.5" />
          </button>

          <button
            v-else-if="onboarding.status === 'DRAFT'"
            @click="submitFinal"
            :disabled="isSaving"
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <Send class="w-4 h-4" /> Kirim Formulir Data Diri Final
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
