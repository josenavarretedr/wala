<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">
      Paso 1: Información Inicial
    </h2>
    <p class="text-sm text-gray-500 mb-6">
      Elige cómo quieres configurar los guiones
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- ── SELECTOR DE TIPO DE INPUT ── -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          v-for="tipo in tiposInput"
          :key="tipo.value"
          type="button"
          @click="formData.tipo_input = tipo.value"
          :class="[
            'p-3 rounded-xl border-2 text-left transition-all',
            formData.tipo_input === tipo.value
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300 bg-white',
          ]"
        >
          <div class="text-lg mb-1">{{ tipo.icon }}</div>
          <div class="text-xs font-bold text-gray-900">{{ tipo.label }}</div>
          <div class="text-xs text-gray-500 mt-0.5 leading-tight">
            {{ tipo.desc }}
          </div>
        </button>
      </div>

      <!-- ── CAMPOS COMUNES ── -->
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
        <input
          v-model="formData.tema"
          type="text"
          required
          placeholder="O escribe un tema personalizado..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

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

      <!-- ── CAMPOS TIPO: COMPLETO ── -->
      <template v-if="formData.tipo_input === 'completo'">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Ruta *</label
            >
            <select
              v-model="formData.ruta"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">Seleccionar...</option>
              <option value="tecnica">Técnica — posicionamiento experto</option>
              <option value="viral">Viral — expansión de alcance</option>
              <option value="amplia">Amplia — atracción tangencial</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Tipo de Contenido *</label
            >
            <select
              v-model="formData.tipo_contenido"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">Seleccionar...</option>
              <option value="educativo">Educativo</option>
              <option value="practico">Práctico</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Narrativa *</label
            >
            <select
              v-model="formData.narrativa"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">Seleccionar...</option>
              <option value="directa">Directa cotidiana</option>
              <option value="estructurada">Estructurada causal</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Sector / Contexto específico</label
          >
          <input
            v-model="formData.sector_contexto"
            type="text"
            placeholder="Ej: bodega de barrio, zona sur, clientes con fiado"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <p class="text-xs text-gray-500 mt-1">
            Cuanto más específico, mejores ejemplos genera la IA
          </p>
        </div>
      </template>

      <!-- ── CAMPOS TIPO: PROPORCION ── -->
      <template v-else-if="formData.tipo_input === 'proporcion'">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Ruta *</label
            >
            <select
              v-model="formData.ruta"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">Seleccionar...</option>
              <option value="tecnica">Técnica</option>
              <option value="viral">Viral</option>
              <option value="amplia">Amplia</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Narrativa *</label
            >
            <select
              v-model="formData.narrativa"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">Seleccionar...</option>
              <option value="directa">Directa cotidiana</option>
              <option value="estructurada">Estructurada causal</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Distribución Educativo / Práctico</label
          >
          <div
            class="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3"
          >
            <div class="flex items-center gap-4">
              <label class="w-28 text-sm text-gray-700">Educativos</label>
              <input
                v-model.number="formData.educativos"
                type="number"
                min="0"
                :max="formData.cantidad"
                class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
              />
              <div class="flex-1 bg-purple-200 rounded-full h-2">
                <div
                  class="bg-purple-600 h-2 rounded-full transition-all"
                  :style="{
                    width: `${(formData.educativos / formData.cantidad) * 100}%`,
                  }"
                ></div>
              </div>
              <span class="text-xs text-gray-500 w-8 text-right">{{
                formData.educativos
              }}</span>
            </div>
            <div class="flex items-center gap-4">
              <label class="w-28 text-sm text-gray-700">Prácticos</label>
              <input
                v-model.number="formData.practicos"
                type="number"
                min="0"
                :max="formData.cantidad"
                class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
              />
              <div class="flex-1 bg-blue-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all"
                  :style="{
                    width: `${(formData.practicos / formData.cantidad) * 100}%`,
                  }"
                ></div>
              </div>
              <span class="text-xs text-gray-500 w-8 text-right">{{
                formData.practicos
              }}</span>
            </div>
            <p
              v-if="
                formData.educativos + formData.practicos !== formData.cantidad
              "
              class="text-xs text-orange-600"
            >
              La suma ({{ formData.educativos + formData.practicos }}) debe ser
              igual a la cantidad total ({{ formData.cantidad }})
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Sector / Contexto específico</label
          >
          <input
            v-model="formData.sector_contexto"
            type="text"
            placeholder="Ej: ferretería de motores para lanchas, selva peruana"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </template>

      <!-- ── CAMPOS TIPO: MIXTO ── -->
      <template v-else-if="formData.tipo_input === 'mixto'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Distribución de Rutas + Narrativas</label
          >
          <div
            class="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3"
          >
            <p class="text-xs text-gray-500 mb-2">
              Indica cuántos videos de cada combinación (total =
              {{ formData.cantidad }})
            </p>
            <div
              v-for="combo in combosDisponibles"
              :key="combo.key"
              class="flex items-center gap-3"
            >
              <div class="flex-1 text-sm text-gray-700">
                <span
                  :class="rutaBadgeClass(combo.ruta)"
                  class="px-2 py-0.5 rounded text-xs font-medium mr-1"
                  >{{ combo.rutaLabel }}</span
                >
                <span class="text-gray-500 text-xs">{{ combo.tipoLabel }}</span>
                <span
                  :class="narrativaBadgeClass(combo.narrativa)"
                  class="px-2 py-0.5 rounded text-xs font-medium ml-1"
                  >{{ combo.narrativaLabel }}</span
                >
              </div>
              <input
                v-model.number="formData.contenido[combo.key]"
                type="number"
                min="0"
                :max="formData.cantidad"
                class="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
              />
            </div>
            <p
              v-if="totalMixto !== formData.cantidad"
              class="text-xs text-orange-600 pt-2 border-t border-orange-100"
            >
              Suma actual: {{ totalMixto }} / {{ formData.cantidad }} videos
            </p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Sector / Contexto específico</label
          >
          <input
            v-model="formData.sector_contexto"
            type="text"
            placeholder="Ej: repostería, pedidos custom para eventos"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </template>

      <!-- ── CAMPOS TIPO: MINIMO ── -->
      <template v-else-if="formData.tipo_input === 'minimo'">
        <div
          class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800"
        >
          <strong>La IA decide:</strong> Con solo el tema y la cantidad, Grok
          analizará el contexto y determinará la mejor ruta, tipo de contenido,
          narrativa y distribución de voces. Podrás confirmar o ajustar en el
          siguiente paso.
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Sector / Contexto (opcional)</label
          >
          <input
            v-model="formData.sector_contexto"
            type="text"
            placeholder="Ej: precios en bodega de barrio (opcional, mejora el resultado)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </template>

      <!-- ── BOTÓN SUBMIT ── -->
      <div class="flex justify-end pt-2">
        <button
          type="submit"
          class="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 transition-colors"
        >
          Continuar
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
import { ref, computed, watch } from "vue";

const emit = defineEmits(["submit"]);

// ── TIPOS DE INPUT ──
const tiposInput = [
  {
    value: "completo",
    icon: "🎯",
    label: "Completo",
    desc: "Tú eliges: ruta, tipo y narrativa",
  },
  {
    value: "proporcion",
    icon: "⚖️",
    label: "Proporción",
    desc: "Ruta fija, tú decides edu/prác",
  },
  {
    value: "mixto",
    icon: "🎨",
    label: "Mixto",
    desc: "Combinas rutas y narrativas",
  },
  {
    value: "minimo",
    icon: "✨",
    label: "Mínimo",
    desc: "Solo el tema, la IA decide",
  },
];

// ── ESTADO DEL FORMULARIO ──
const formData = ref({
  tipo_input: "minimo",
  tema: "",
  cantidad: 5,
  // Completo
  ruta: "",
  tipo_contenido: "",
  narrativa: "",
  sector_contexto: "",
  // Proporción
  educativos: 3,
  practicos: 2,
  // Mixto
  contenido: {
    tecnica_educativo_directa: 0,
    tecnica_educativo_estructurada: 0,
    tecnica_practico_directa: 0,
    tecnica_practico_estructurada: 0,
    viral_educativo_directa: 0,
    viral_practico_directa: 0,
    amplia_educativo_directa: 0,
    amplia_educativo_estructurada: 0,
    amplia_practico_directa: 0,
    amplia_practico_estructurada: 0,
  },
});

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

// ── COMBOS PARA TIPO MIXTO ──
const combosDisponibles = [
  {
    key: "tecnica_educativo_directa",
    ruta: "tecnica",
    rutaLabel: "Técnica",
    tipoLabel: "Educativo",
    narrativa: "directa",
    narrativaLabel: "Directa",
  },
  {
    key: "tecnica_educativo_estructurada",
    ruta: "tecnica",
    rutaLabel: "Técnica",
    tipoLabel: "Educativo",
    narrativa: "estructurada",
    narrativaLabel: "Estructurada",
  },
  {
    key: "tecnica_practico_directa",
    ruta: "tecnica",
    rutaLabel: "Técnica",
    tipoLabel: "Práctico",
    narrativa: "directa",
    narrativaLabel: "Directa",
  },
  {
    key: "tecnica_practico_estructurada",
    ruta: "tecnica",
    rutaLabel: "Técnica",
    tipoLabel: "Práctico",
    narrativa: "estructurada",
    narrativaLabel: "Estructurada",
  },
  {
    key: "viral_educativo_directa",
    ruta: "viral",
    rutaLabel: "Viral",
    tipoLabel: "Educativo",
    narrativa: "directa",
    narrativaLabel: "Directa",
  },
  {
    key: "viral_practico_directa",
    ruta: "viral",
    rutaLabel: "Viral",
    tipoLabel: "Práctico",
    narrativa: "directa",
    narrativaLabel: "Directa",
  },
  {
    key: "amplia_educativo_directa",
    ruta: "amplia",
    rutaLabel: "Amplia",
    tipoLabel: "Educativo",
    narrativa: "directa",
    narrativaLabel: "Directa",
  },
  {
    key: "amplia_educativo_estructurada",
    ruta: "amplia",
    rutaLabel: "Amplia",
    tipoLabel: "Educativo",
    narrativa: "estructurada",
    narrativaLabel: "Estructurada",
  },
  {
    key: "amplia_practico_directa",
    ruta: "amplia",
    rutaLabel: "Amplia",
    tipoLabel: "Práctico",
    narrativa: "directa",
    narrativaLabel: "Directa",
  },
  {
    key: "amplia_practico_estructurada",
    ruta: "amplia",
    rutaLabel: "Amplia",
    tipoLabel: "Práctico",
    narrativa: "estructurada",
    narrativaLabel: "Estructurada",
  },
];

const totalMixto = computed(() =>
  Object.values(formData.value.contenido).reduce((a, b) => a + (b || 0), 0),
);

// Sync proporción al cambiar cantidad
watch(
  () => formData.value.cantidad,
  (newVal) => {
    const mitad = Math.round(newVal / 2);
    formData.value.educativos = mitad;
    formData.value.practicos = newVal - mitad;
  },
);

// ── BADGE HELPERS ──
const rutaBadgeClass = (ruta) =>
  ({
    tecnica: "bg-indigo-100 text-indigo-700",
    viral: "bg-pink-100 text-pink-700",
    amplia: "bg-amber-100 text-amber-700",
  })[ruta] || "bg-gray-100 text-gray-700";

const narrativaBadgeClass = (narrativa) =>
  ({
    directa: "bg-green-100 text-green-700",
    estructurada: "bg-blue-100 text-blue-700",
  })[narrativa] || "bg-gray-100 text-gray-700";

// ── SUBMIT ──
const handleSubmit = () => {
  if (!formData.value.tema.trim()) {
    alert("Por favor ingresa un tema");
    return;
  }

  const tipo = formData.value.tipo_input;

  if (
    tipo === "completo" &&
    (!formData.value.ruta ||
      !formData.value.tipo_contenido ||
      !formData.value.narrativa)
  ) {
    alert("Por favor completa la ruta, tipo de contenido y narrativa");
    return;
  }
  if (
    tipo === "proporcion" &&
    (!formData.value.ruta || !formData.value.narrativa)
  ) {
    alert("Por favor selecciona la ruta y narrativa");
    return;
  }
  if (
    tipo === "proporcion" &&
    formData.value.educativos + formData.value.practicos !==
      formData.value.cantidad
  ) {
    alert(
      `La suma de educativos + prácticos debe ser igual a ${formData.value.cantidad}`,
    );
    return;
  }
  if (tipo === "mixto" && totalMixto.value !== formData.value.cantidad) {
    alert(
      `La suma de videos en el mixto debe ser igual a ${formData.value.cantidad}`,
    );
    return;
  }

  // Construir payload según tipo
  const payload = {
    tipo_input: tipo,
    tema: formData.value.tema.trim(),
    cantidad: formData.value.cantidad,
    sector_contexto: formData.value.sector_contexto.trim() || null,
  };

  if (tipo === "completo") {
    payload.ruta = formData.value.ruta;
    payload.tipo_contenido = formData.value.tipo_contenido;
    payload.narrativa = formData.value.narrativa;
  } else if (tipo === "proporcion") {
    payload.ruta = formData.value.ruta;
    payload.narrativa = formData.value.narrativa;
    payload.educativos = formData.value.educativos;
    payload.practicos = formData.value.practicos;
  } else if (tipo === "mixto") {
    payload.contenido = Object.fromEntries(
      Object.entries(formData.value.contenido).filter(([, v]) => v > 0),
    );
  }

  emit("submit", payload);
};
</script>
