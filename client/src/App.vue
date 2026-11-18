<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
      <p>© 2026 TalentAssess Enterprise™ Showcase Repository. Clean Architecture & High-Performance Psychometrics Portfolio.</p>
    </footer>
  </div>
</template>
