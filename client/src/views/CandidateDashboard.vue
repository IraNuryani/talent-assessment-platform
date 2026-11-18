<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import {
  FileText,
  Clock,
  CheckCircle,
  PlayCircle,
  PenTool,
  AlertCircle,
  Building,
  MapPin,
  ArrowRight,
  ExternalLink,
} from 'lucide-vue-next';

const auth = useAuthStore();
const applications = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  await fetchApplications();
});

async function fetchApplications() {
  if (!auth.token) return;
  try {
    const res = await fetch('/api/applications/my', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    applications.value = await res.json();
  } catch (err) {
    console.error('Failed to load applications', err);
  } finally {
    isLoading.value = false;
  }
}

// Stage map
function getStageInfo(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return { step: 1, label: 'Lamaran Dikirim', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'SCREENED':
      return { step: 2, label: 'Lolos Seleksi Berkas', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'PSYCHOTEST_INVITED':
      return { step: 3, label: 'Undangan Psikotes Aktif', color: 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse' };
    case 'PSYCHOTEST_PASSED':
      return { step: 4, label: 'Lolos Asesmen Psikometri', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'HIRED':
      return { step: 5, label: 'Selamat! Anda DITERIMA', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' };
    case 'REJECTED':
      return { step: 0, label: 'Belum Lolos Seleksi', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    default:
      return { step: 1, label: status, color: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-10 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Status & Riwayat Lamaran Saya</h1>
        <p class="text-xs text-slate-500 mt-1">Pantau progres seleksi, jadwal tes psikometri daring, dan formulir data diri.</p>
      </div>

      <router-link
        to="/"
        class="text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 w-fit"
      >
        Cari Lowongan Lainnya <ArrowRight class="w-3.5 h-3.5" />
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 2" :key="i" class="h-44 bg-white rounded-2xl animate-pulse"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="applications.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-sky-50 text-brand-600 flex items-center justify-center mx-auto">
        <FileText class="w-8 h-8" />
      </div>
      <h3 class="text-base font-bold text-slate-800">Belum Ada Lamaran yang Dikirimkan</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        Anda belum melamar lowongan kerja mana pun. Silakan buka katalog lowongan untuk mengirimkan lamaran pertama Anda.
      </p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors"
      >
        Lihat Lowongan Kerja
      </router-link>
    </div>

    <!-- Application Cards -->
    <div v-else class="space-y-6">
      <div
        v-for="app in applications"
        :key="app.id"
        class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 transition-all hover:border-slate-300"
      >
        <!-- Card Top Details -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                No. Registrasi: {{ app.registrationNo }}
              </span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-md border" :class="getStageInfo(app.status).color">
                {{ getStageInfo(app.status).label }}
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-900">{{ app.vacancy.title }}</h2>
            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span class="flex items-center gap-1"><Building class="w-3.5 h-3.5 text-slate-400" /> {{ app.vacancy.department }}</span>
              <span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5 text-slate-400" /> {{ app.vacancy.plantLocation }}</span>
            </div>
          </div>

          <!-- Action Button based on Stage -->
          <div class="shrink-0 flex items-center gap-2">
            <!-- Stage: PSYCHOTEST_INVITED -->
            <router-link
              v-if="app.status === 'PSYCHOTEST_INVITED'"
              :to="`/assessment/${app.id}`"
              class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 animate-bounce"
            >
              <PlayCircle class="w-4 h-4" /> Buka Ruang Ujian Psikotes
            </router-link>

            <!-- Stage: HIRED / ACCEPTED -->
            <router-link
              v-else-if="app.status === 'HIRED'"
              :to="`/onboarding/${app.id}`"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <PenTool class="w-4 h-4" />
              {{ app.onboarding?.status === 'SUBMITTED' ? 'Lihat Formulir Onboarding' : 'Isi Form Data Diri (F-HRD-002)' }}
            </router-link>

            <!-- Stage: Already Taken Tests -->
            <router-link
              v-else-if="app.kraepelinResult || app.papiResult"
              :to="`/assessment/${app.id}`"
              class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <CheckCircle class="w-4 h-4 text-emerald-600" /> Lihat Hasil Asesmen Anda
            </router-link>
          </div>
        </div>

        <!-- 5-Stage Stepper Progression -->
        <div class="space-y-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tahapan Seleksi Pelamar:</p>
          <div class="grid grid-cols-5 gap-2 text-center text-xs">
            <div
              v-for="(st, idx) in [
                { id: 'SUBMITTED', title: '1. Lamaran' },
                { id: 'SCREENED', title: '2. Berkas' },
                { id: 'PSYCHOTEST_INVITED', title: '3. Psikotes' },
                { id: 'PSYCHOTEST_PASSED', title: '4. Wawancara' },
                { id: 'HIRED', title: '5. Diterima' },
              ]"
              :key="st.id"
              class="p-2.5 rounded-xl border transition-all"
              :class="[
                getStageInfo(app.status).step >= idx + 1
                  ? 'bg-sky-50 border-brand-300 text-brand-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
              ]"
            >
              <span class="block truncate">{{ st.title }}</span>
            </div>
          </div>
        </div>

        <!-- Contextual Notification Box -->
        <div v-if="app.status === 'PSYCHOTEST_INVITED'" class="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <h4 class="font-bold">Undangan Ujian Psikometri Daring Telah Terbit!</h4>
            <p class="leading-relaxed">
              Tim HRD telah memverifikasi berkas Anda dan mengundang Anda untuk mengikuti ujian daring (Tes Kraepelin & PAPI Kostick).
              Token akses Anda: <code class="font-mono font-bold bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-700">{{ app.testToken }}</code>.
            </p>
          </div>
        </div>

        <div v-else-if="app.status === 'HIRED'" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <CheckCircle class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <h4 class="font-bold">Selamat! Anda Dinyatakan DITERIMA Bekerja!</h4>
            <p class="leading-relaxed">
              Silakan lengkapi formulir data diri calon karyawan (F-HRD-002) 6-tahap dan bubuhkan tanda tangan digital Anda untuk proses penyiapan berkas dan pencetakan dokumen resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
