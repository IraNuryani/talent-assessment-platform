<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import KraepelinRunner from '../components/KraepelinRunner.vue';
import PapiRunner from '../components/PapiRunner.vue';
import { Award, PieChart, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-vue-next';

const route = useRoute();
const applicationId = route.params.applicationId as string;

const activeTab = ref<'KRAEPELIN' | 'PAPI'>('KRAEPELIN');
const application = ref<any>(null);
const kraepelinDone = ref(false);
const papiDone = ref(false);

onMounted(async () => {
  try {
    const res = await fetch(`/api/applications/${applicationId}`);
    application.value = await res.json();
    if (application.value?.kraepelinResult) kraepelinDone.value = true;
    if (application.value?.papiResult) papiDone.value = true;
  } catch (err) {
    console.error('Failed to load application details', err);
  }
});

function handleKraepelinComplete() {
  kraepelinDone.value = true;
  activeTab.value = 'PAPI';
}

function handlePapiComplete() {
  papiDone.value = true;
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
    <!-- Top Back Link -->
    <div class="flex items-center justify-between">
      <router-link to="/my-applications" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft class="w-4 h-4" /> Kembali ke Lamaran Saya
      </router-link>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500 font-medium">No. Registrasi:</span>
        <span class="text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
          {{ application?.registrationNo || 'VAC-...' }}
        </span>
      </div>
    </div>

    <!-- Title & Exam Header -->
    <div class="bg-gradient-to-r from-slate-900 to-brand-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800">
          <ShieldCheck class="w-3.5 h-3.5" /> Ruang Ujian Psikometri Daring
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight">
          {{ application?.vacancy?.title || 'Evaluasi Kemampuan & Profil Kinerja' }}
        </h1>
        <p class="text-xs text-slate-300">
          Selesaikan kedua instrumen psikotes berikut untuk melengkapi tahapan evaluasi seleksi Anda.
        </p>
      </div>

      <!-- Test Completion Badges -->
      <div class="flex items-center gap-3">
        <div class="text-center p-2 rounded-xl bg-slate-800/80 border border-slate-700 min-w-24">
          <span class="text-[10px] text-slate-400 block font-semibold">1. Kraepelin</span>
          <span :class="['text-xs font-bold flex items-center justify-center gap-1 mt-0.5', kraepelinDone ? 'text-emerald-400' : 'text-amber-400']">
            <CheckCircle2 v-if="kraepelinDone" class="w-3.5 h-3.5" />
            {{ kraepelinDone ? 'Selesai' : 'Belum' }}
          </span>
        </div>
        <div class="text-center p-2 rounded-xl bg-slate-800/80 border border-slate-700 min-w-24">
          <span class="text-[10px] text-slate-400 block font-semibold">2. PAPI-Kostick</span>
          <span :class="['text-xs font-bold flex items-center justify-center gap-1 mt-0.5', papiDone ? 'text-emerald-400' : 'text-amber-400']">
            <CheckCircle2 v-if="papiDone" class="w-3.5 h-3.5" />
            {{ papiDone ? 'Selesai' : 'Belum' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center space-x-2 border-b border-slate-200 pb-2">
      <button
        @click="activeTab = 'KRAEPELIN'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
          activeTab === 'KRAEPELIN'
            ? 'bg-brand-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        ]"
      >
        <Award class="w-4 h-4" /> 1. Tes Kraepelin (Kurva Kerja)
      </button>

      <button
        @click="activeTab = 'PAPI'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
          activeTab === 'PAPI'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        ]"
      >
        <PieChart class="w-4 h-4" /> 2. Tes PAPI-Kostick (Kepribadian Kerja)
      </button>
    </div>

    <!-- Tab Contents -->
    <div>
      <div v-show="activeTab === 'KRAEPELIN'">
        <KraepelinRunner :applicationId="applicationId" @completed="handleKraepelinComplete" />
      </div>

      <div v-show="activeTab === 'PAPI'">
        <PapiRunner :applicationId="applicationId" @completed="handlePapiComplete" />
      </div>
    </div>
  </div>
</template>
