<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { LogIn, User, Shield, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();

const email = ref('kandidat@example.com');
const password = ref('kandidat123');
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
  isLoading.value = true;
  error.value = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data = await res.json();
    if (res.ok) {
      auth.setAuth(data.token, data.user);
      if (data.user.role === 'HR_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/my-applications');
      }
    } else {
      error.value = data.error || 'Login gagal';
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function fillDemo(type: 'CANDIDATE' | 'HR_ADMIN') {
  if (type === 'HR_ADMIN') {
    email.value = 'admin@talentassess.com';
    password.value = 'admin123';
  } else {
    email.value = 'kandidat@example.com';
    password.value = 'kandidat123';
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-sky-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <LogIn class="w-6 h-6" />
        </div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
        <p class="text-xs text-slate-500">Lacak lamaran kerja atau kelola evaluasi kandidat.</p>
      </div>

      <!-- Quick Demo Fill Buttons -->
      <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Akun Uji Coba Portofolio (1-Click):</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            @click="fillDemo('CANDIDATE')"
            class="py-1.5 px-2 bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <User class="w-3.5 h-3.5 text-brand-600" /> Kandidat Demo
          </button>
          <button
            type="button"
            @click="fillDemo('HR_ADMIN')"
            class="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Shield class="w-3.5 h-3.5 text-indigo-600" /> HR Recruiter
          </button>
        </div>
      </div>

      <div v-if="error" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" /> {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Alamat Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <LogIn class="w-4 h-4" /> {{ isLoading ? 'Memproses...' : 'Masuk Sekarang' }}
        </button>
      </form>

      <div class="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Belum memiliki akun?
        <router-link to="/register" class="font-bold text-brand-600 hover:underline">
          Daftar Sebagai Pelamar
        </router-link>
      </div>
    </div>
  </div>
</template>
