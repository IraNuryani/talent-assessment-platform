<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { HelpCircle, CheckCircle2, RotateCcw, PieChart } from 'lucide-vue-next';
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = defineProps<{
  applicationId: string;
}>();

const emit = defineEmits<{
  (e: 'completed', result: any): void;
}>();

const questions = ref<any[]>([]);
const currentQuestionIndex = ref(0);
const selectedAnswers = ref<Record<number, { selectedOption: 'A' | 'B'; traitCode: string }>>({});
const isLoading = ref(true);
const isCompleted = ref(false);
const evaluationResult = ref<any>(null);

onMounted(async () => {
  try {
    const res = await fetch('/api/psychotest/papi/questions');
    questions.value = await res.json();
  } catch (err) {
    console.error('Failed to load PAPI questions', err);
  } finally {
    isLoading.value = false;
  }
});

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null;
});

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0;
  return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100);
});

function selectAnswer(option: 'A' | 'B', traitCode: string) {
  if (!currentQuestion.value) return;
  selectedAnswers.value[currentQuestion.value.id] = { selectedOption: option, traitCode };

  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  } else {
    submitPapi();
  }
}

async function submitPapi() {
  const answersPayload = Object.keys(selectedAnswers.value).map((qId) => {
    const item = selectedAnswers.value[Number(qId)];
    return {
      questionNumber: Number(qId),
      selectedOption: item.selectedOption,
      traitCode: item.traitCode,
    };
  });

  try {
    const res = await fetch('/api/psychotest/papi/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: props.applicationId,
        answers: answersPayload,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      evaluationResult.value = data.evaluation;
      isCompleted.value = true;
      emit('completed', data);
    }
  } catch (err) {
    console.error('Failed to submit PAPI', err);
  }
}

function resetTest() {
  selectedAnswers.value = {};
  currentQuestionIndex.value = 0;
  isCompleted.value = false;
  evaluationResult.value = null;
}

// Radar Chart Config
const radarChartData = computed(() => {
  if (!evaluationResult.value) return { labels: [], datasets: [] };
  return {
    labels: evaluationResult.value.radarLabels,
    datasets: [
      {
        label: 'Profil Skor Peran & Kebutuhan Kerja (PAPI Kostick)',
        backgroundColor: 'rgba(14, 165, 233, 0.25)',
        borderColor: '#0284c7',
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0284c7',
        data: evaluationResult.value.radarValues,
      },
    ],
  };
});

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { color: '#e2e8f0' },
      grid: { color: '#e2e8f0' },
      suggestedMin: 0,
      suggestedMax: 5,
      ticks: { stepSize: 1 },
    },
  },
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-5 border-b border-slate-100">
      <div>
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <PieChart class="w-5 h-5 text-indigo-600" />
          Inventori Kepribadian Kerja PAPI-Kostick (20 Dimensi)
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Pilihlah salah satu dari 2 pernyataan yang paling mencerminkan diri dan gaya kerja Anda sehari-hari.
        </p>
      </div>

      <span v-if="!isCompleted" class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
        Soal {{ currentQuestionIndex + 1 }} dari {{ questions.length }}
      </span>
    </div>

    <!-- Active Question Card -->
    <div v-if="!isCompleted && currentQuestion" class="py-8 max-w-xl mx-auto">
      <!-- Progress Bar -->
      <div class="w-full bg-slate-100 rounded-full h-2 mb-8">
        <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progressPercent}%` }"></div>
      </div>

      <div class="space-y-4">
        <!-- Option A -->
        <button
          @click="selectAnswer('A', currentQuestion.optionA.traitCode)"
          class="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 active:bg-indigo-100 transition-all flex items-center gap-4 group"
        >
          <div class="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-sm text-slate-700 transition-colors">
            A
          </div>
          <p class="text-sm font-semibold text-slate-800 flex-1 leading-relaxed">
            {{ currentQuestion.optionA.text }}
          </p>
        </button>

        <!-- Option B -->
        <button
          @click="selectAnswer('B', currentQuestion.optionB.traitCode)"
          class="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 active:bg-indigo-100 transition-all flex items-center gap-4 group"
        >
          <div class="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-sm text-slate-700 transition-colors">
            B
          </div>
          <p class="text-sm font-semibold text-slate-800 flex-1 leading-relaxed">
            {{ currentQuestion.optionB.text }}
          </p>
        </button>
      </div>
    </div>

    <!-- Result / Radar Chart View -->
    <div v-else-if="isCompleted" class="py-4 space-y-6">
      <div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <CheckCircle2 class="w-6 h-6 text-indigo-600" />
          <div>
            <h4 class="text-sm font-bold text-indigo-950">Asesmen PAPI-Kostick Selesai</h4>
            <p class="text-xs text-indigo-700">Diagram jaring laba-laba 20 dimensi kepribadian kerja berhasil di-generate.</p>
          </div>
        </div>
        <button
          @click="resetTest"
          class="text-xs font-semibold text-indigo-800 hover:text-indigo-950 border border-indigo-300 rounded-lg px-3 py-1.5 bg-white shadow-xs flex items-center gap-1"
        >
          <RotateCcw class="w-3.5 h-3.5" /> Uji Coba Ulang
        </button>
      </div>

      <!-- Radar Chart Visualizer -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div class="h-80 bg-slate-50 rounded-2xl border border-slate-200 p-4">
          <Radar :data="radarChartData" :options="radarChartOptions" />
        </div>

        <!-- Interpretations preview -->
        <div class="h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          <h5 class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Interpretasi Dimensi Utama:</h5>
          <div
            v-for="diag in evaluationResult?.diagnosticSummary.filter((d: any) => d.score > 0)"
            :key="diag.code"
            class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-slate-800">{{ diag.code }} - {{ diag.name }}</span>
              <span class="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Skor: {{ diag.score }}</span>
            </div>
            <p class="text-slate-600">{{ diag.interpretation }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
