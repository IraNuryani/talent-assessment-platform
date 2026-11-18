<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RotateCcw, Check } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'save', base64: string): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const hasSignature = ref(false);

let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a'; // Slate-900
    }
  }
});

function getCoordinates(event: MouseEvent | TouchEvent) {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;

  if ('touches' in event) {
    return {
      x: (event.touches[0].clientX - rect.left) * scaleX,
      y: (event.touches[0].clientY - rect.top) * scaleY,
    };
  } else {
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }
}

function startDrawing(e: MouseEvent | TouchEvent) {
  isDrawing.value = true;
  hasSignature.value = true;
  const { x, y } = getCoordinates(e);
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
}

function draw(e: MouseEvent | TouchEvent) {
  if (!isDrawing.value || !ctx) return;
  e.preventDefault();
  const { x, y } = getCoordinates(e);
  ctx.lineTo(x, y);
  ctx.stroke();
}

function stopDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false;
    emitSignature();
  }
}

function clearSignature() {
  if (!canvasRef.value || !ctx) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  hasSignature.value = false;
  emit('save', '');
}

function emitSignature() {
  if (!canvasRef.value) return;
  const base64 = canvasRef.value.toDataURL('image/png');
  emit('save', base64);
}
</script>

<template>
  <div class="border border-slate-300 rounded-xl p-3 bg-white shadow-inner flex flex-col items-center">
    <div class="w-full flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500">
      <span>Goreskan tanda tangan Anda di area putih berikut:</span>
      <button
        type="button"
        @click="clearSignature"
        class="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold hover:underline"
      >
        <RotateCcw class="w-3.5 h-3.5" /> Hapus / Bersihkan
      </button>
    </div>

    <!-- Interactive Canvas -->
    <div class="relative w-full overflow-hidden my-2 border border-dashed border-slate-300 rounded-lg bg-slate-50/50 flex justify-center">
      <canvas
        ref="canvasRef"
        width="500"
        height="200"
        class="touch-none cursor-crosshair max-w-full h-auto bg-transparent"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawing"
        @touchmove="draw"
        @touchend="stopDrawing"
      ></canvas>

      <div
        v-if="!hasSignature"
        class="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic select-none"
      >
        (Klik atau sentuh lalu tarik garis tanda tangan di sini)
      </div>
    </div>

    <div class="w-full text-right">
      <span v-if="hasSignature" class="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
        <Check class="w-3.5 h-3.5" /> Tanda tangan terekam secara digital
      </span>
      <span v-else class="text-[11px] text-slate-400 italic">
        Belum ada tanda tangan
      </span>
    </div>
  </div>
</template>
