<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">
      Paso 1: Información Inicial
    </h2>
    <p class="text-sm text-gray-500 mb-6">
      Define el tema y contexto. La IA analizará la mejor distribución.
    </p>

    <!-- Overlay loading cuando se analiza distribución -->
    <div
      v-if="loadingAnalisis"
      class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"
      ></div>
      <p class="text-gray-700 font-medium">
        Analizando tema y distribución ideal...
      </p>
      <p class="text-sm text-gray-500 mt-1">Esto toma unos segundos</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- ── TEMA ── -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Tema *</label
        >
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="t in temasSugeridos"
            :key="t"
            type="button"
            @click="formData.tema = t"
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              formData.tema === t
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700',
            ]"
          >
            {{ t }}
          </button>
        </div>
        <div class="flex gap-2">
          <input
            v-model="formData.tema"
            type="text"
            required
            placeholder="Escribe un tema, ej: costos, ventas, inventario..."
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            :disabled="!formData.tema.trim() || loadingMejora"
            @click="handleMejorarTema"
            class="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <span
              v-if="loadingMejora"
              class="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"
            ></span>
            <template v-else>Mejorar tema</template>
          </button>
        </div>
        <!-- Chip sugerido post-mejorar -->
        <div v-if="temaMejorado" class="mt-2 flex items-center gap-2">
          <span class="text-xs text-gray-500">Sugerido:</span>
          <button
            type="button"
            @click="
              formData.tema = temaMejorado;
              temaMejorado = null;
            "
            class="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-800 hover:bg-green-100 transition-colors flex items-center gap-1"
          >
            {{ temaMejorado }}
            <span class="text-green-600 font-medium ml-1">Usar</span>
          </button>
          <button
            type="button"
            @click="temaMejorado = null"
            class="text-gray-400 hover:text-gray-600 text-xs"
          >
            Descartar
          </button>
        </div>
      </div>

      <!-- ── SECTOR / CONTEXTO ── -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Sector / Contexto *</label
        >
        <input
          v-model="formData.sector_contexto"
          type="text"
          required
          placeholder="Ej: bodega de barrio zona sur, repostería pedidos eventos"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
        <p class="text-xs text-gray-500 mt-1">
          Cuanto más específico, mejores ejemplos genera la IA
        </p>
      </div>

      <!-- ── CANTIDAD ── -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Cantidad de videos *</label
        >
        <input
          v-model.number="formData.cantidad"
          type="number"
          min="1"
          max="10"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
        <p class="text-xs text-gray-500 mt-1">Recomendado: 5 videos</p>
      </div>

      <!-- ── FASE DE EMBUDO ── -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Fase de Embudo *</label
        >
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            v-for="fase in fasesEmbudo"
            :key="fase.value"
            type="button"
            @click="formData.fase_embudo = fase.value"
            :class="[
              'p-3 rounded-xl border-2 text-left transition-all',
              formData.fase_embudo === fase.value
                ? fase.activeClass
                : 'border-gray-200 hover:border-gray-300 bg-white',
            ]"
          >
            <div class="text-lg mb-1">{{ fase.icon }}</div>
            <div class="text-xs font-bold text-gray-900">{{ fase.label }}</div>
            <div class="text-xs text-gray-500 mt-0.5 leading-tight">
              {{ fase.desc }}
            </div>
          </button>
        </div>
      </div>

      <!-- ── BOTÓN SUBMIT ── -->
      <div class="flex justify-end pt-2">
        <button
          type="submit"
          :disabled="loadingAnalisis"
          class="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analizar y Continuar
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { mejorarTema, analizarDistribucion } from "@/services/iaGuionesService";

const emit = defineEmits(["submit"]);

// ── ESTADO DEL FORMULARIO ──
const formData = ref({
  tema: "",
  sector_contexto: "",
  cantidad: 5,
  fase_embudo: "auto",
});

const temaMejorado = ref(null);
const loadingMejora = ref(false);
const loadingAnalisis = ref(false);

// ── TEMAS SUGERIDOS ──
const temasSugeridos = [
  "Flujo de caja",
  "Control de inventario",
  "Costos y márgenes",
  "Precios de venta",
  "Gestión de clientes",
  "Finanzas básicas",
  "Ventas",
  "Productividad",
];

// ── FASES DE EMBUDO ──
const fasesEmbudo = [
  {
    value: "auto",
    icon: "🤖",
    label: "Auto (IA decide)",
    desc: "La IA elige la mejor combinación de fases",
    activeClass: "border-purple-500 bg-purple-50",
  },
  {
    value: "tofu",
    icon: "🔥",
    label: "ToFu",
    desc: "Alcance masivo. Viral + Directa",
    activeClass: "border-pink-500 bg-pink-50",
  },
  {
    value: "mofu",
    icon: "🎯",
    label: "MoFu",
    desc: "Autoridad. Técnica + Estructurada",
    activeClass: "border-indigo-500 bg-indigo-50",
  },
  {
    value: "bofu",
    icon: "💎",
    label: "BoFu",
    desc: "Conversión. Incluye Huevo(s) de Oro",
    activeClass: "border-amber-500 bg-amber-50",
  },
];

// ── MEJORAR TEMA ──
const handleMejorarTema = async () => {
  try {
    loadingMejora.value = true;
    temaMejorado.value = null;
    const resultado = await mejorarTema(
      formData.value.tema.trim(),
      formData.value.sector_contexto.trim() || null,
    );
    temaMejorado.value = resultado;
  } catch (error) {
    console.error("Error al mejorar tema:", error);
  } finally {
    loadingMejora.value = false;
  }
};

// ── SUBMIT: analiza distribución y emite resultado ──
const handleSubmit = async () => {
  if (!formData.value.tema.trim()) return;
  if (!formData.value.sector_contexto.trim()) return;

  try {
    loadingAnalisis.value = true;

    const inputs = {
      tema: formData.value.tema.trim(),
      sector_contexto: formData.value.sector_contexto.trim(),
      cantidad: formData.value.cantidad,
      fase_embudo: formData.value.fase_embudo,
    };

    const resultado = await analizarDistribucion(inputs);

    emit("submit", {
      ...inputs,
      planVideos: resultado.plan_videos || [],
      metaPrevio: resultado.meta_previo || null,
    });
  } catch (error) {
    console.error("Error al analizar distribución:", error);
    alert("Error al analizar distribución: " + error.message);
  } finally {
    loadingAnalisis.value = false;
  }
};
</script>
