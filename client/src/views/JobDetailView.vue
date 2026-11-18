<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { MapPin, Building, Calendar, CheckCircle2, ArrowLeft, Send } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const vacancy = ref<any>(null);
const isLoading = ref(true);
const isApplying = ref(false);
const message = ref('');
const error = ref('');

onMounted(async () => {
  try {
    const res = await fetch(`/api/vacancies/${route.params.id}`);
    vacancy.value = await res.json();
  } catch (err) {
    console.error('Failed to load vacancy', err);
  } finally {
    isLoading.value = false;
  }
});

async function handleApply() {
  if (!auth.isAuthenticated) {
    // Auto-login as demo candidate if not authenticated
    await auth.switchRole('CANDIDATE');
  }

  isApplying.value = true;
  message.value = '';
  error.value = '';

  try {
    const res = await fetch('/api/applications/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ vacancyId: vacancy.value.id }),
    });

    const data = await res.json();
    if (res.ok) {
      message.value = 'Lamaran Anda berhasil dikirimkan! Mengarahkan ke halaman Lamaran Saya...';
      setTimeout(() => {
        router.push('/my-applications');
      }, 1500);
    } else {
      error.value = data.error || 'Gagal mengirimkan lamaran';
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isApplying.value = false;
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <router-link to="/" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-6">
      <ArrowLeft class="w-4 h-4" /> Kembali ke Katalog Lowongan
    </router-link>

    <div v-if="isLoading" class="h-96 bg-white rounded-2xl animate-pulse"></div>

    <div v-else-if="vacancy" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
      <!-- Title & Header -->
      <div class="space-y-4 pb-6 border-b border-slate-100">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold px-3 py-1 rounded-md bg-brand-50 text-brand-700">
            {{ vacancy.department }}
          </span>
          <span class="text-xs font-semibold px-3 py-1 rounded-md bg-emerald-50 text-emerald-700">
            {{ vacancy.type }}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ vacancy.title }}
        </h1>

        <div class="flex flex-wrap items-center gap-6 text-xs text-slate-500">
          <span class="flex items-center gap-1.5">
            <MapPin class="w-4 h-4 text-slate-400" /> {{ vacancy.plantLocation }}
          </span>
          <span class="flex items-center gap-1.5">
            <Calendar class="w-4 h-4 text-slate-400" /> Diposting Baru Saja
          </span>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Deskripsi Pekerjaan & Tanggung Jawab:</h3>
        <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {{ vacancy.description }}
        </p>
      </div>

      <!-- Requirements -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Kualifikasi & Persyaratan:</h3>
        <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {{ vacancy.requirements }}
        </p>
      </div>

      <!-- Feedback Alerts -->
      <div v-if="message" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-600" /> {{ message }}
      </div>
      <div v-if="error" class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
        {{ error }}
      </div>

      <!-- Action Footer -->
      <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs text-slate-500 font-medium">Batas Waktu Pengiriman: <span class="font-bold text-slate-800">Terbuka Selama Kuota Tersedia</span></p>
          <span class="text-[11px] text-slate-400">Seleksi berkas & psikotes diproses secara digital.</span>
        </div>

        <button
          @click="handleApply"
          :disabled="isApplying"
          class="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Send class="w-4 h-4" /> {{ isApplying ? 'Mengirimkan Lamaran...' : 'Kirim Lamaran Sekarang' }}
        </button>
      </div>
    </div>
  </div>
</template>
