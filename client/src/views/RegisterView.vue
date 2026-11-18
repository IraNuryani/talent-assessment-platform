<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { UserPlus, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');
const nik = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleRegister() {
  isLoading.value = true;
  error.value = '';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
        phone: phone.value,
        nik: nik.value,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      auth.setAuth(data.token, data.user);
      router.push('/my-applications');
    } else {
      error.value = data.error || 'Pendaftaran gagal';
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-sky-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <UserPlus class="w-6 h-6" />
        </div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Pendaftaran Akun Pelamar</h2>
        <p class="text-xs text-slate-500">Daftarkan biodata Anda untuk mengikuti proses seleksi kerja.</p>
      </div>

      <div v-if="error" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" /> {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
            placeholder="Contoh: Dimas Prasetyo"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Alamat Email Aktif</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
          <input
            v-model="phone"
            type="text"
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
            placeholder="+62 812-xxxx-xxxx"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
          <input
            v-model="nik"
            type="text"
            maxlength="16"
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium font-mono"
            placeholder="16 Digit NIK"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <UserPlus class="w-4 h-4" /> {{ isLoading ? 'Mendaftarkan...' : 'Buat Akun Pelamar' }}
        </button>
      </form>

      <div class="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Sudah memiliki akun?
        <router-link to="/login" class="font-bold text-brand-600 hover:underline">
          Masuk ke Sini
        </router-link>
      </div>
    </div>
  </div>
</template>
