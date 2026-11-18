<script setup lang="ts">
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { Briefcase, Award, CheckCircle, Shield, User, LogOut, ArrowRightLeft } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();

async function handleRoleSwitch(role: 'CANDIDATE' | 'HR_ADMIN') {
  const success = await auth.switchRole(role);
  if (success) {
    if (role === 'HR_ADMIN') {
      router.push('/admin');
    } else {
      router.push('/my-applications');
    }
  }
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Brand Logo -->
      <router-link to="/" class="flex items-center space-x-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <Briefcase class="w-5 h-5" />
        </div>
        <div>
          <span class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            TalentAssess <span class="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-brand-700 font-semibold">Enterprise</span>
          </span>
          <p class="text-[10px] text-slate-500 font-medium">ATS & Psychometrics Mesh</p>
        </div>
      </router-link>

      <!-- Center Nav Links -->
      <nav class="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
        <router-link to="/" class="hover:text-brand-600 transition-colors flex items-center gap-1.5" active-class="text-brand-600 font-semibold">
          <Briefcase class="w-4 h-4" /> Lowongan Kerja
        </router-link>
        <router-link v-if="auth.isAuthenticated" to="/my-applications" class="hover:text-brand-600 transition-colors flex items-center gap-1.5" active-class="text-brand-600 font-semibold">
          <Award class="w-4 h-4" /> Lamaran Saya
        </router-link>
        <router-link v-if="auth.isHrAdmin" to="/admin" class="hover:text-brand-600 transition-colors flex items-center gap-1.5 text-indigo-600" active-class="text-indigo-700 font-semibold">
          <Shield class="w-4 h-4" /> HR Recruiter Portal
        </router-link>
      </nav>

      <!-- Right Area: Interactive Role Switcher & Auth Buttons -->
      <div class="flex items-center space-x-3">
        <!-- Showcase Role Switcher (Portfolio Feature) -->
        <div class="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span class="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <ArrowRightLeft class="w-3 h-3" /> Demo Switcher:
          </span>
          <button
            @click="handleRoleSwitch('CANDIDATE')"
            :class="[
              'px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1',
              auth.isCandidate ? 'bg-white text-brand-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <User class="w-3.5 h-3.5" /> Pelamar
          </button>
          <button
            @click="handleRoleSwitch('HR_ADMIN')"
            :class="[
              'px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1',
              auth.isHrAdmin ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <Shield class="w-3.5 h-3.5" /> HR Recruiter
          </button>
        </div>

        <!-- Auth Status -->
        <template v-if="auth.isAuthenticated">
          <div class="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-bold text-slate-800 leading-tight">{{ auth.user?.name }}</p>
              <span :class="['text-[10px] px-1.5 py-0.2 rounded font-semibold', auth.isHrAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-brand-700']">
                {{ auth.user?.role }}
              </span>
            </div>
            <button @click="handleLogout" title="Keluar" class="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors">
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-1.5">
            Masuk
          </router-link>
          <router-link to="/register" class="text-xs font-semibold bg-brand-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-brand-700 transition-colors">
            Daftar Pelamar
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>
