<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Briefcase, MapPin, Building, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-vue-next';

const vacancies = ref<any[]>([]);
const isLoading = ref(true);
const router = useRouter();

onMounted(async () => {
  try {
    const res = await fetch('/api/vacancies');
    vacancies.value = await res.json();
  } catch (err) {
    console.error('Failed to load vacancies', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative bg-gradient-to-b from-brand-900 via-slate-900 to-slate-900 text-white py-16 sm:py-24 px-4 overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div class="relative max-w-5xl mx-auto text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-sky-300 text-xs font-semibold backdrop-blur-xs">
          <Sparkles class="w-3.5 h-3.5" /> Platform Seleksi & Psikometri Terdistribusi Skala Korporasi
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Temukan Karir Terbaik & Buktikan Potensi Kognitif Anda
        </h1>

        <p class="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          Sistem rekrutmen terintegrasi: dari pelamaran kerja, evaluasi kurva kerja Kraepelin real-time, asesmen kepribadian PAPI-Kostick, hingga digital onboarding dengan tanda tangan digital resmi.
        </p>

        <!-- Feature Pills -->
        <div class="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
          <span class="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Zap class="w-3.5 h-3.5 text-amber-400" /> Real-time Kraepelin Engine
          </span>
          <span class="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" /> PAPI 20-Trait Radar Profiler
          </span>
          <span class="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Briefcase class="w-3.5 h-3.5 text-sky-400" /> Digital Onboarding & Canvas Signature
          </span>
        </div>
      </div>
    </section>

    <!-- Vacancy Catalog -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-8">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Daftar Lowongan Pekerjaan Aktif</h2>
          <p class="text-xs text-slate-500 mt-1">Pilih posisi yang sesuai dengan keahlian dan lokasi penempatan Anda.</p>
        </div>
        <span class="text-xs font-semibold bg-sky-100 text-brand-700 px-3 py-1.5 rounded-lg w-fit">
          {{ vacancies.length }} Posisi Terbuka
        </span>
      </div>

      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="job in vacancies"
          :key="job.id"
          class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-brand-500/50 transition-all flex flex-col justify-between group"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {{ job.department }}
              </span>
              <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {{ job.type }}
              </span>
            </div>

            <h3 class="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
              {{ job.title }}
            </h3>

            <div class="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ job.plantLocation }}</span>
            </div>

            <p class="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
              {{ job.description }}
            </p>
          </div>

          <div class="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
            <router-link
              :to="`/jobs/${job.id}`"
              class="w-full bg-slate-900 hover:bg-brand-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Lihat Rincian & Melamar <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
