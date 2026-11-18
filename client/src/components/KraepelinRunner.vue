<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Play, RotateCcw, Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-vue-next';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps<{
  applicationId: string;
}>();

const emit = defineEmits<{
  (e: 'completed', result: any): void;
}>();

// Config
const totalColumns = ref(5); // 5 demo columns for fast showcase, or user can toggle to 10
const columnDurationSeconds = ref(6); // 6s per column for fast recruiter demo
const isRunning = ref(false);
const isCompleted = ref(false);
const currentColumn = ref(1);
const timeRemaining = ref(6);
const activeIndex = ref(0);

// Numbers generation for current column
const columnNumbers = ref<number[]>([]);
const candidateAnswers = ref<number[]>([]);
const currentAnswerInput = ref('');

// Column stats history: [{ column: 1, attempted: 12, correct: 11, wrong: 1 }]
const columnStats = ref<Array<{ column: number; totalRow: number; attempted: number; correct: number; wrong: number }>>([]);
const finalMetrics = ref<any>(null);

let timerInterval: any = null;

function generateNumbers() {
  const nums: number[] = [];
  for (let i = 0; i < 20; i++) {
    nums.push(Math.floor(Math.random() * 9) + 1); // 1 - 9
  }
  columnNumbers.value = nums;
  candidateAnswers.value = [];
  activeIndex.value = 0;
  currentAnswerInput.value = '';
}

const currentPair = computed(() => {
  if (activeIndex.value < columnNumbers.value.length - 1) {
    const bottom = columnNumbers.value[activeIndex.value];
    const top = columnNumbers.value[activeIndex.value + 1];
    const correctSum = (bottom + top) % 10;
    return { bottom, top, correctSum };
  }
  return null;
});

function startTest() {
  isRunning.value = true;
  isCompleted.value = false;
  currentColumn.value = 1;
  columnStats.value = [];
  finalMetrics.value = null;
  startColumn(1);
}

function startColumn(col: number) {
  currentColumn.value = col;
  timeRemaining.value = columnDurationSeconds.value;
  generateNumbers();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 1) {
      timeRemaining.value--;
    } else {
      finishCurrentColumn();
    }
  }, 1000);
}

function submitAnswer(num: number) {
  if (!isRunning.value || !currentPair.value) return;

  const isCorrect = num === currentPair.value.correctSum;
  candidateAnswers.value.push(num);
  activeIndex.value++;

  if (activeIndex.value >= columnNumbers.value.length - 1) {
    finishCurrentColumn();
  }
}

function handleKeyInput(e: KeyboardEvent) {
  if (!isRunning.value) return;
  const num = parseInt(e.key);
  if (!isNaN(num) && num >= 0 && num <= 9) {
    submitAnswer(num);
  }
}

function finishCurrentColumn() {
  clearInterval(timerInterval);

  // Calculate current column stats
  let correct = 0;
  for (let i = 0; i < candidateAnswers.value.length; i++) {
    const expected = (columnNumbers.value[i] + columnNumbers.value[i + 1]) % 10;
    if (candidateAnswers.value[i] === expected) {
      correct++;
    }
  }

  const attempted = candidateAnswers.value.length;
  const wrong = attempted - correct;

  columnStats.value.push({
    column: currentColumn.value,
    totalRow: columnNumbers.value.length,
    attempted,
    correct,
    wrong,
  });

  if (currentColumn.value < totalColumns.value) {
    startColumn(currentColumn.value + 1);
  } else {
    finishEntireTest();
  }
}

async function finishEntireTest() {
  isRunning.value = false;
  isCompleted.value = true;
  clearInterval(timerInterval);

  try {
    const res = await fetch('/api/psychotest/kraepelin/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: props.applicationId,
        columnStats: columnStats.value,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      finalMetrics.value = data.metrics;
      emit('completed', data);
    }
  } catch (err) {
    console.error('Failed to submit Kraepelin', err);
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyInput);
});

onUnmounted(() => {
  clearInterval(timerInterval);
  window.removeEventListener('keydown', handleKeyInput);
});

// Chart.js Data & Options
const chartData = computed(() => {
  return {
    labels: columnStats.value.map((c) => `Kolom ${c.column}`),
    datasets: [
      {
        label: 'Jumlah Dijawab (Attempted)',
        backgroundColor: '#0284c7',
        borderColor: '#0284c7',
        data: columnStats.value.map((c) => c.attempted),
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Jumlah Benar (Correct)',
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        data: columnStats.value.map((c) => c.correct),
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Kurva Kerja Kraepelin (Work-Curve Trajectory)' },
  },
  scales: {
    y: { beginAtZero: true, suggestedMax: 15 },
  },
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
      <div>
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award class="w-5 h-5 text-brand-600" />
          Tes Kurva Kerja Kraepelin (Aritmetika Cepat)
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Jumlahkan 2 angka vertikal dari bawah ke atas. Masukkan digit satuan (Contoh: 8 + 7 = 15 ➔ klik 5).
        </p>
      </div>

      <!-- Quick Controls -->
      <div v-if="!isRunning && !isCompleted" class="flex items-center gap-2">
        <select v-model="totalColumns" class="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium bg-slate-50">
          <option :value="5">Mode Cepat (5 Kolom)</option>
          <option :value="10">Mode Standar (10 Kolom)</option>
        </select>
        <button
          @click="startTest"
          class="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          <Play class="w-4 h-4" /> Mulai Tes Kraepelin
        </button>
      </div>
    </div>

    <!-- Active Test Running View -->
    <div v-if="isRunning" class="py-8 flex flex-col items-center">
      <!-- Status Bar -->
      <div class="w-full max-w-md flex items-center justify-between bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 mb-6">
        <span class="text-xs font-bold text-slate-700">Kolom {{ currentColumn }} dari {{ totalColumns }}</span>
        <div class="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
          <span>Sisa Waktu: {{ timeRemaining }}s</span>
        </div>
      </div>

      <!-- Number Column Box (Vertical Sum) -->
      <div class="relative w-44 bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center space-y-4">
        <div class="text-4xl font-extrabold tracking-widest text-sky-400">
          {{ currentPair?.top }}
        </div>
        <div class="w-16 h-1 bg-slate-700 rounded-full"></div>
        <div class="text-4xl font-extrabold tracking-widest text-emerald-400">
          {{ currentPair?.bottom }}
        </div>
        <span class="text-[10px] text-slate-400 font-mono">Bawah + Atas</span>
      </div>

      <!-- Keypad (0-9) for touch / mouse (also responds to physical keyboard) -->
      <div class="mt-6 w-full max-w-xs">
        <p class="text-center text-xs text-slate-400 mb-3">Ketik angka di keyboard atau klik keypad:</p>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="digit in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="digit"
            @click="submitAnswer(digit)"
            class="h-11 bg-white hover:bg-brand-50 active:bg-brand-100 border border-slate-200 hover:border-brand-500 rounded-xl font-bold text-base text-slate-800 shadow-sm transition-all"
          >
            {{ digit }}
          </button>
        </div>
      </div>
    </div>

    <!-- Completed & Result Analytics View -->
    <div v-else-if="isCompleted" class="py-4 space-y-6">
      <div class="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <CheckCircle2 class="w-6 h-6 text-emerald-600" />
          <div>
            <h4 class="text-sm font-bold text-emerald-950">Tes Kraepelin Telah Selesai</h4>
            <p class="text-xs text-emerald-700">Metrik kinerja kognitif dan kurva kerja berhasil dikalkulasi.</p>
          </div>
        </div>
        <button
          @click="startTest"
          class="text-xs font-semibold text-emerald-800 hover:text-emerald-950 border border-emerald-300 rounded-lg px-3 py-1.5 bg-white shadow-xs flex items-center gap-1"
        >
          <RotateCcw class="w-3.5 h-3.5" /> Uji Coba Ulang
        </button>
      </div>

      <!-- 5 Diagnostic Psychometric Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <span class="text-[11px] font-semibold text-slate-500">Kecepatan (Panker)</span>
          <p class="text-xl font-black text-brand-600 mt-1">{{ finalMetrics?.workCapacity || 0 }}</p>
          <span class="text-[10px] text-slate-400">Total Benar</span>
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <span class="text-[11px] font-semibold text-slate-500">Ketelitian (Accuracy)</span>
          <p class="text-xl font-black text-emerald-600 mt-1">{{ finalMetrics?.accuracyRate || 0 }}%</p>
          <span class="text-[10px] text-slate-400">Benar / Terjawab</span>
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <span class="text-[11px] font-semibold text-slate-500">Kestabilan (100 - CV)</span>
          <p class="text-xl font-black text-indigo-600 mt-1">{{ finalMetrics?.consistencyScore || 0 }}</p>
          <span class="text-[10px] text-slate-400">Konsistensi Ritme</span>
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <span class="text-[11px] font-semibold text-slate-500">Indeks Kelelahan</span>
          <p class="text-xl font-black text-amber-600 mt-1">{{ finalMetrics?.fatigueIndex || 0 }}%</p>
          <span class="text-[10px] text-slate-400">H1 vs H2</span>
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center col-span-2 md:col-span-1">
          <span class="text-[11px] font-semibold text-slate-500">Pola Kurva Kerja</span>
          <p class="text-base font-bold text-slate-800 capitalize mt-1.5 flex items-center justify-center gap-1">
            <TrendingUp class="w-4 h-4 text-brand-600" />
            {{ finalMetrics?.pattern || 'Normal' }}
          </p>
          <span class="text-[10px] text-slate-400">Quartile Moving Avg</span>
        </div>
      </div>

      <!-- Real-time Chart.js Work Curve -->
      <div class="h-64 bg-slate-50 rounded-xl border border-slate-200 p-3">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Initial Idle State -->
    <div v-else class="py-12 text-center text-slate-500">
      <div class="w-14 h-14 rounded-2xl bg-sky-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
        <Award class="w-7 h-7" />
      </div>
      <h4 class="font-bold text-slate-800 text-base">Siap Memulai Asesmen Kraepelin</h4>
      <p class="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
        Tes ini menguji konsistensi tempo kerja, daya tahan mental, dan akurasi di bawah batasan waktu yang cepat.
      </p>
      <button
        @click="startTest"
        class="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
      >
        <Play class="w-4 h-4" /> Mulai Simulasi Tes
      </button>
    </div>
  </div>
</template>
