<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import {
  Shield,
  Users,
  Search,
  Filter,
  CheckCircle,
  Eye,
  Send,
  Award,
  PenTool,
  Download,
  Check,
  X,
  Building,
  UserCheck,
} from 'lucide-vue-next';

const auth = useAuthStore();
const applications = ref<any[]>([]);
const isLoading = ref(true);
const selectedApp = ref<any>(null);
const showDetailModal = ref(false);
const showOnboardingModal = ref(false);

onMounted(async () => {
  if (!auth.isHrAdmin) {
    await auth.switchRole('HR_ADMIN');
  }
  await loadApplications();
});

async function loadApplications() {
  try {
    const res = await fetch('/api/applications/all', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    applications.value = await res.json();
  } catch (err) {
    console.error('Failed to load applications', err);
  } finally {
    isLoading.value = false;
  }
}

async function updateStatus(appId: string, newStatus: string) {
  try {
    const res = await fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      await loadApplications();
    }
  } catch (err) {
    console.error('Failed to update status', err);
  }
}

async function verifyOnboarding(appId: string) {
  try {
    const res = await fetch(`/api/onboarding/${appId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      await loadApplications();
      showOnboardingModal.value = false;
    }
  } catch (err) {
    console.error('Failed to verify onboarding', err);
  }
}

function openPsychogram(app: any) {
  selectedApp.value = app;
  showDetailModal.value = true;
}

function openOnboarding(app: any) {
  selectedApp.value = app;
  showOnboardingModal.value = true;
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <!-- Admin Header Banner -->
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="space-y-1.5">
        <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
          <Shield class="w-3.5 h-3.5" /> Portal Pengelola Rekrutmen & Asesmen HR
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Talent Acquisition & Assessment Hub
        </h1>
        <p class="text-xs text-slate-300 max-w-xl">
          Kelola alur seleksi pelamar, undang tes psikotes online, review metrik kurva kerja Kraepelin & profil radar PAPI, serta verifikasi tanda tangan digital onboarding.
        </p>
      </div>

      <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-36">
        <span class="text-[11px] text-slate-300 block font-semibold">Total Pelamar</span>
        <span class="text-3xl font-black text-white">{{ applications.length }}</span>
        <span class="text-[10px] text-indigo-300 block">Kandidat Terdaftar</span>
      </div>
    </div>

    <!-- Pipeline Table Container -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Daftar Pelamar & Tahap Seleksi Aktif</h2>
          <p class="text-xs text-slate-500 mt-0.5">Ubah status pelamar untuk menggerakkan pipeline seleksi.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
            <tr>
              <th class="p-4">No. Registrasi</th>
              <th class="p-4">Kandidat</th>
              <th class="p-4">Lowongan Kerja</th>
              <th class="p-4">Status Seleksi</th>
              <th class="p-4">Hasil Psikometri</th>
              <th class="p-4">Onboarding (F-HRD-002)</th>
              <th class="p-4 text-right">Aksi HRD</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="app in applications" :key="app.id" class="hover:bg-slate-50/70 transition-colors">
              <td class="p-4 font-mono font-bold text-slate-800">
                {{ app.registrationNo }}
              </td>
              <td class="p-4">
                <span class="font-bold text-slate-900 block">{{ app.user.name }}</span>
                <span class="text-[11px] text-slate-500">{{ app.user.email }}</span>
              </td>
              <td class="p-4">
                <span class="font-semibold text-slate-800 block">{{ app.vacancy.title }}</span>
                <span class="text-[11px] text-slate-400">{{ app.vacancy.plantLocation }}</span>
              </td>
              <td class="p-4">
                <span
                  class="px-2.5 py-1 rounded-md font-bold text-[10px]"
                  :class="{
                    'bg-blue-100 text-blue-800': app.status === 'SUBMITTED',
                    'bg-amber-100 text-amber-800': app.status === 'SCREENED',
                    'bg-purple-100 text-purple-800': app.status === 'PSYCHOTEST_INVITED',
                    'bg-indigo-100 text-indigo-800': app.status === 'PSYCHOTEST_PASSED',
                    'bg-emerald-100 text-emerald-800': app.status === 'HIRED',
                    'bg-rose-100 text-rose-800': app.status === 'REJECTED',
                  }"
                >
                  {{ app.status }}
                </span>
              </td>
              <td class="p-4">
                <button
                  v-if="app.kraepelinResult || app.papiResult"
                  @click="openPsychogram(app)"
                  class="px-2.5 py-1 bg-sky-50 text-brand-700 hover:bg-sky-100 border border-brand-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
                >
                  <Award class="w-3.5 h-3.5" /> Lihat Psikogram
                </button>
                <span v-else class="text-slate-400 italic">Belum Ujian</span>
              </td>
              <td class="p-4">
                <button
                  v-if="app.onboarding"
                  @click="openOnboarding(app)"
                  class="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
                >
                  <PenTool class="w-3.5 h-3.5" />
                  {{ app.onboarding.status === 'VERIFIED' ? 'Terverifikasi' : 'Review TTD' }}
                </button>
                <span v-else class="text-slate-400 italic">-</span>
              </td>

              <!-- Action Controls to change stage -->
              <td class="p-4 text-right">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    v-if="app.status === 'SUBMITTED'"
                    @click="updateStatus(app.id, 'SCREENED')"
                    class="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-xs"
                    title="Loloskan Berkas"
                  >
                    Lolos Berkas
                  </button>

                  <button
                    v-if="app.status === 'SCREENED'"
                    @click="updateStatus(app.id, 'PSYCHOTEST_INVITED')"
                    class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-xs"
                    title="Kirim Undangan Tes Online"
                  >
                    Undang Psikotes
                  </button>

                  <button
                    v-if="app.status === 'PSYCHOTEST_INVITED'"
                    @click="updateStatus(app.id, 'PSYCHOTEST_PASSED')"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-xs"
                    title="Loloskan Psikotes"
                  >
                    Loloskan Psikotes
                  </button>

                  <button
                    v-if="app.status === 'PSYCHOTEST_PASSED'"
                    @click="updateStatus(app.id, 'HIRED')"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-xs"
                    title="Terima Kandidat Bekerja"
                  >
                    Terima (Hired)
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PSYCHOGRAM EVALUATION MODAL -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Hasil Evaluasi Psikometri: {{ selectedApp?.user?.name }}</h3>
            <p class="text-xs text-slate-500">Posisi: {{ selectedApp?.vacancy?.title }}</p>
          </div>
          <button @click="showDetailModal = false" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Kraepelin Summary -->
        <div v-if="selectedApp?.kraepelinResult" class="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-3">
          <h4 class="text-xs font-bold text-brand-900 uppercase tracking-wider">Kinerja Kurva Kerja Kraepelin:</h4>
          <div class="grid grid-cols-4 gap-2 text-center text-xs">
            <div class="bg-white p-2 rounded-xl border border-sky-200">
              <span class="text-[10px] text-slate-500 block">Panker</span>
              <strong class="text-sm text-brand-700">{{ selectedApp.kraepelinResult.workCapacity }}</strong>
            </div>
            <div class="bg-white p-2 rounded-xl border border-sky-200">
              <span class="text-[10px] text-slate-500 block">Ketelitian</span>
              <strong class="text-sm text-emerald-700">{{ selectedApp.kraepelinResult.accuracyRate }}%</strong>
            </div>
            <div class="bg-white p-2 rounded-xl border border-sky-200">
              <span class="text-[10px] text-slate-500 block">Kestabilan</span>
              <strong class="text-sm text-indigo-700">{{ selectedApp.kraepelinResult.consistencyScore }}</strong>
            </div>
            <div class="bg-white p-2 rounded-xl border border-sky-200">
              <span class="text-[10px] text-slate-500 block">Pola</span>
              <strong class="text-sm text-amber-700 capitalize">{{ selectedApp.kraepelinResult.pattern }}</strong>
            </div>
          </div>
        </div>

        <!-- PAPI Summary -->
        <div v-if="selectedApp?.papiResult" class="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
          <h4 class="text-xs font-bold text-indigo-900 uppercase tracking-wider">Profil Kepribadian PAPI Kostick:</h4>
          <p class="text-xs text-indigo-800 leading-relaxed">
            Data radar 20 dimensi berhasil di-generate. Kandidat menunjukkan skor tinggi pada Peran Kerja Keras dan Kebutuhan Menyelesaikan Tugas (N).
          </p>
        </div>

        <div class="text-right">
          <button @click="showDetailModal = false" class="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- ONBOARDING & SIGNATURE REVIEW MODAL -->
    <div v-if="showOnboardingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Verifikasi Berkas Onboarding (F-HRD-002)</h3>
            <p class="text-xs text-slate-500">Calon Karyawan: {{ selectedApp?.user?.name }}</p>
          </div>
          <button @click="showOnboardingModal = false" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div class="flex justify-between"><span class="text-slate-500">Nama Lengkap:</span> <strong class="text-slate-800">{{ selectedApp?.user?.name }}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">NIK:</span> <strong class="text-slate-800 font-mono">{{ selectedApp?.user?.nik || '-' }}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Panggilan:</span> <strong class="text-slate-800">{{ selectedApp?.onboarding?.nickname || '-' }}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Alamat Domisili:</span> <strong class="text-slate-800">{{ selectedApp?.onboarding?.domicileAddress || '-' }}</strong></div>
          </div>

          <!-- Digital Signature Box -->
          <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <h5 class="font-bold text-emerald-950 text-xs">Tanda Tangan Digital Resmi Pelamar:</h5>
            <img
              v-if="selectedApp?.onboarding?.signatureBase64"
              :src="selectedApp?.onboarding?.signatureBase64"
              alt="Digital Signature"
              class="h-28 mx-auto border border-emerald-300 bg-white p-2 rounded-xl shadow-xs"
            />
            <p class="text-[11px] text-emerald-700 font-mono">
              Ditandatangani secara elektronik pada: {{ selectedApp?.onboarding?.signedCity }}, {{ selectedApp?.onboarding?.signedDate }}
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <span class="text-xs font-semibold text-slate-500">
            Status Saat Ini: <strong class="text-slate-800">{{ selectedApp?.onboarding?.status }}</strong>
          </span>

          <div class="flex items-center gap-2">
            <button
              v-if="selectedApp?.onboarding?.status !== 'VERIFIED'"
              @click="verifyOnboarding(selectedApp.id)"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Check class="w-4 h-4" /> Setujui & Verifikasi Berkas
            </button>
            <button @click="showOnboardingModal = false" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
