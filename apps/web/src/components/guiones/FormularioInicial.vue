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

        <!-- Nivel 1: temas principales -->
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="t in temasPrincipales"
            :key="t.valor"
            type="button"
            @click="seleccionarTemaPrincipal(t)"
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              temaPrincipalSeleccionado?.valor === t.valor
                ? 'bg-purple-600 text-white shadow-sm scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700',
            ]"
          >
            {{ t.etiqueta }}
          </button>
        </div>

        <!-- Nivel 2: subtemas (solo si hay tema principal seleccionado) -->
        <transition name="fade-slide">
          <div
            v-if="
              temaPrincipalSeleccionado &&
              temaPrincipalSeleccionado.subtemas.length
            "
            class="mb-3 p-3 bg-purple-50 border border-purple-100 rounded-xl"
          >
            <p
              class="text-xs font-medium text-purple-600 mb-2 uppercase tracking-wide"
            >
              Ángulos para "{{ temaPrincipalSeleccionado.etiqueta }}"
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="sub in temaPrincipalSeleccionado.subtemas"
                :key="sub.valor"
                type="button"
                @click="seleccionarSubtema(sub)"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                  formData.tema === sub.valor
                    ? 'bg-purple-600 text-white shadow-sm scale-105'
                    : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100',
                ]"
              >
                {{ sub.etiqueta }}
              </button>
            </div>
          </div>
        </transition>

        <!-- Input libre + botón mejorar -->
        <div class="flex gap-2">
          <input
            v-model="formData.tema"
            type="text"
            required
            placeholder="O escribe tu propio tema, ej: cómo saber si estás ganando o perdiendo..."
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
            <template v-else>✨ Mejorar tema</template>
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
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Sector / Contexto *
        </label>
        <input
          v-model="formData.sector_contexto"
          type="text"
          required
          placeholder="Ej: bodega de barrio zona sur, repostería pedidos eventos"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
        <div class="mt-3">
          <div class="flex items-center justify-between gap-2 mb-2">
            <p class="text-xs font-medium text-gray-600">Sugerencias rápidas</p>
            <button
              type="button"
              @click="cargarOtrosSectores"
              :disabled="loadingSectores"
              class="px-2.5 py-1 text-xs rounded-md border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span
                v-if="loadingSectores"
                class="animate-spin h-3.5 w-3.5 border-2 border-purple-500 border-t-transparent rounded-full"
              ></span>
              <template v-else>🎲 Otros 10</template>
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="sector in sectoresSugeridos"
              :key="sector"
              type="button"
              @click="seleccionarSectorContexto(sector)"
              class="px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              {{ sector }}
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Cuanto más específico, mejores ejemplos genera la IA
        </p>
      </div>

      <!-- ── CANTIDAD ── -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Cantidad de videos *
        </label>
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

      <!-- ── FASE DE EMBUDO (V8: 4 etapas reales + auto) ── -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Fase de Embudo *
        </label>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            v-for="fase in fasesEmbudo"
            :key="fase.value"
            type="button"
            @click="formData.fase_embudo = fase.value"
            :class="[
              'p-3 rounded-xl border-2 text-left transition-all duration-200',
              formData.fase_embudo === fase.value
                ? fase.activeClass
                : 'border-gray-200 hover:border-gray-300 bg-white',
            ]"
          >
            <div class="text-base mb-1">{{ fase.icon }}</div>
            <div class="text-xs font-bold text-gray-900 leading-tight">
              {{ fase.label }}
            </div>
            <div class="text-xs text-gray-500 mt-0.5 leading-tight">
              {{ fase.desc }}
            </div>
          </button>
        </div>

        <!-- Aviso contextual según etapa seleccionada -->
        <transition name="fade-slide">
          <div
            v-if="avisoFaseActual"
            class="mt-2 p-3 rounded-lg text-xs leading-relaxed"
            :class="avisoFaseActual.clases"
          >
            {{ avisoFaseActual.texto }}
          </div>
        </transition>
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
import { ref, computed } from "vue";
import {
  mejorarTema,
  analizarDistribucion,
  sugerirSectoresContexto,
} from "@/services/iaGuionesService";

const emit = defineEmits(["submit"]);

// ── ESTADO ──
const formData = ref({
  tema: "",
  sector_contexto: "",
  cantidad: 5,
  fase_embudo: "auto",
});

const temaMejorado = ref(null);
const loadingMejora = ref(false);
const loadingAnalisis = ref(false);
const temaPrincipalSeleccionado = ref(null);
const loadingSectores = ref(false);

const sectoresCatalogo = [
  "bodega de barrio zona sur",
  "repostería pedidos por Instagram",
  "tienda de ropa femenina por WhatsApp",
  "ferretería de barrio con ventas al contado",
  "cafetería pequeña cerca de oficinas",
  "salón de belleza con agenda semanal",
  "emprendimiento de comida casera por encargo",
  "kiosco escolar con picos estacionales",
  "taller mecánico para motos",
  "venta de accesorios para celulares",
  "panadería familiar con delivery local",
  "barbería con sistema de turnos",
  "distribuidora de agua y gas",
  "tienda de mascotas con baño y peluquería",
  "papelería y librería de barrio",
  "local de artículos de limpieza a granel",
  "servicio de catering para eventos pequeños",
  "minimarket 24 horas",
  "tienda de zapatos por catálogo",
  "negocio de sublimación y regalos personalizados",
  "fabrica casera de mermeladas artesanales",
  "vivero con venta de plantas ornamentales",
  "gimnasio de barrio con membresías mensuales",
  "puesto de comida rápida nocturna",
  "tienda de cosmética natural",
  "lavandería autoservicio",
  "estudio de uñas a domicilio",
  "servicio técnico de computadoras",
  "local de jugos y smoothies",
  "tienda de juguetes didácticos",
];

const sectoresSugeridos = ref(obtenerSectoresAleatoriosLocales());

// ── TEMAS CON SUBTEMAS (V8: lenguaje cotidiano, sin tecnicismos) ──
// Los "valores" son strings en lenguaje cotidiano, no tecnicismos contables.
// Regla del Glosario V8: el valor que llega al prompt NO puede ser "Flujo de caja",
// debe ser su traducción. Los subtemas ofrecen ángulos concretos por ruta.
const temasPrincipales = [
  {
    valor: "saber si tu negocio gana o pierde",
    etiqueta: "¿Gano o pierdo?",
    subtemas: [
      {
        valor: "cómo saber cuánto te quedó al final del día",
        etiqueta: "Lo que te quedó al cerrar",
      },
      {
        valor: "por qué vendés todo el día y no ves la plata",
        etiqueta: "Vendés pero no ves la plata",
      },
      {
        valor: "cómo separar la plata del negocio de la de tu casa",
        etiqueta: "Negocio vs. casa",
      },
      {
        valor: "cuánto necesitás vender para no perder plata",
        etiqueta: "Mínimo para no perder",
      },
    ],
  },
  {
    valor: "controlar lo que entra y sale de tu negocio cada día",
    etiqueta: "Plata que entra y sale",
    subtemas: [
      {
        valor: "cómo llevar el registro diario sin complicarte",
        etiqueta: "Registro diario simple",
      },
      {
        valor: "cómo saber cuándo vas a quedarte sin plata antes de que pase",
        etiqueta: "Ver el futuro de tu caja",
      },
      {
        valor: "cómo organizar los pagos que tenés que hacer",
        etiqueta: "Organizar pagos",
      },
      {
        valor: "cómo manejar los meses malos sin entrar en pánico",
        etiqueta: "Sobrevivir meses malos",
      },
    ],
  },
  {
    valor: "saber cuánto cobrar por lo que vendés",
    etiqueta: "Precios y cobro",
    subtemas: [
      {
        valor: "cómo calcular el precio sin quedarte corto",
        etiqueta: "Calcular precio real",
      },
      {
        valor: "cómo subir precios sin perder clientes",
        etiqueta: "Subir precios sin drama",
      },
      {
        valor: "por qué cobrar barato te puede hundir",
        etiqueta: "El error de cobrar barato",
      },
      {
        valor: "cómo comparar tu precio con el de la competencia",
        etiqueta: "Precio vs. competencia",
      },
    ],
  },
  {
    valor: "manejar bien el inventario",
    etiqueta: "Inventario",
    subtemas: [
      {
        valor: "cómo saber qué producto te deja más plata",
        etiqueta: "Qué producto rinde más",
      },
      {
        valor: "cómo evitar quedarte sin stock en los momentos clave",
        etiqueta: "Nunca sin stock",
      },
      {
        valor: "qué hacer con el producto que no se mueve",
        etiqueta: "Producto muerto",
      },
      {
        valor: "cómo comprar justo lo que necesitás",
        etiqueta: "Comprar sin exagerar",
      },
    ],
  },
  {
    valor: "vender más sin bajar precios",
    etiqueta: "Vender más",
    subtemas: [
      {
        valor: "cómo hacer que un cliente vuelva solo",
        etiqueta: "Clientes que vuelven",
      },
      {
        valor: "cómo vender más a los clientes que ya tenés",
        etiqueta: "Vender más a los mismos",
      },
      {
        valor: "cómo destacar sin competir por precio",
        etiqueta: "Destacar sin precio",
      },
      {
        valor: "cómo aprovechar los días buenos para cubrir los malos",
        etiqueta: "Días pico vs. días bajos",
      },
    ],
  },
  {
    valor: "organizarte para que el negocio no te controle a ti",
    etiqueta: "Organización",
    subtemas: [
      {
        valor: "cómo dejar de apagar incendios todo el día",
        etiqueta: "Dejar de apagar incendios",
      },
      {
        valor: "cómo saber en qué estás gastando de más",
        etiqueta: "Dónde se va la plata",
      },
      {
        valor: "cómo tomar decisiones sin adivinar",
        etiqueta: "Decidir con datos",
      },
      {
        valor: "cómo ordenar el negocio antes de crecer",
        etiqueta: "Ordenar antes de crecer",
      },
    ],
  },
  {
    valor: "finanzas personales del emprendedor",
    etiqueta: "Tu plata personal",
    subtemas: [
      {
        valor: "cuánto te podés pagar a vos mismo sin dañar el negocio",
        etiqueta: "Cuánto pagarte",
      },
      {
        valor: "cómo ahorrar cuando el negocio va bien",
        etiqueta: "Ahorrar en tiempos buenos",
      },
      {
        valor: "cómo sobrevivir económicamente cuando el negocio baja",
        etiqueta: "Sobrevivir la baja",
      },
    ],
  },
  {
    valor: "crecer el negocio de forma sostenible",
    etiqueta: "Crecer bien",
    subtemas: [
      {
        valor: "cuándo es el momento correcto de contratar a alguien",
        etiqueta: "¿Cuándo contratar?",
      },
      {
        valor: "cómo saber si tu negocio puede crecer sin quebrarse",
        etiqueta: "Crecer sin quebrarse",
      },
      {
        valor: "qué números mirar antes de abrir otra sucursal",
        etiqueta: "Antes de expandirte",
      },
    ],
  },
];

// ── FASES DE EMBUDO V8 (5 opciones: auto + 4 etapas reales) ──
// Cambio crítico V8: MOFU se divide en MOFU-A (activación Premium)
// y MOFU-B (consideración hacia el programa). Son CTAs distintos,
// audiencias distintas y formatos distintos. No se pueden mezclar.
const fasesEmbudo = [
  {
    value: "auto",
    icon: "🤖",
    label: "Auto",
    desc: "IA elige la mezcla ideal",
    activeClass: "border-purple-500 bg-purple-50",
  },
  {
    value: "tofu",
    icon: "🔥",
    label: "TOFU",
    desc: "Atracción. WALA freemium.",
    activeClass: "border-pink-500 bg-pink-50",
  },
  {
    value: "mofu_a",
    icon: "⚡",
    label: "MOFU-A",
    desc: "Consideración. Llamada.",
    activeClass: "border-indigo-500 bg-indigo-50",
  },
  {
    value: "mofu_b",
    icon: "🎯",
    label: "MOFU-B",
    desc: "Activación. WALA Pro.",
    activeClass: "border-blue-500 bg-blue-50",
  },
  {
    value: "bofu",
    icon: "💎",
    label: "BOFU",
    desc: "Conversión. Diagnóstico gratis.",
    activeClass: "border-amber-500 bg-amber-50",
  },
];

// ── AVISO CONTEXTUAL POR FASE (ayuda al usuario a elegir bien) ──
const avisosFase = {
  tofu: {
    texto:
      "TOFU: videos cortos 40–60s. CTA → registro en WALA freemium. Nunca se menciona el programa ni WALA Pro.",
    clases: "bg-pink-50 text-pink-700 border border-pink-100",
  },
  mofu_a: {
    texto:
      "MOFU-A (nuevo en V8): Huevo de Oro suave ~1 min. CTA → Probá WALA Pro 7 días gratis. Audiencia: ya usa freemium. No se menciona el programa.",
    clases: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  },
  mofu_b: {
    texto:
      "MOFU-B: Huevo de Oro profundo 1–1.5 min. CTA dual → Premium (momento 1) + Agendemos una llamada (momento 2). Audiencia: ya usa Premium.",
    clases: "bg-blue-50 text-blue-700 border border-blue-100",
  },
  bofu: {
    texto:
      "BOFU: video personal 1–2 min. CTA → primera asesoría diagnóstico gratis + WALA Pro incluido. Solo Voz A (José). Nunca se menciona el precio.",
    clases: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  auto: null,
};

const avisoFaseActual = computed(() => {
  return avisosFase[formData.value.fase_embudo] || null;
});

// ── SELECCIÓN DE TEMA PRINCIPAL ──
const seleccionarTemaPrincipal = (tema) => {
  if (temaPrincipalSeleccionado.value?.valor === tema.valor) {
    // Segundo clic en el mismo: colapsa subtemas y usa el valor del principal
    formData.value.tema = tema.valor;
    temaPrincipalSeleccionado.value = null;
  } else {
    temaPrincipalSeleccionado.value = tema;
    formData.value.tema = tema.valor;
    temaMejorado.value = null;
  }
};

// ── SELECCIÓN DE SUBTEMA ──
const seleccionarSubtema = (sub) => {
  formData.value.tema = sub.valor;
};

const seleccionarSectorContexto = (sector) => {
  formData.value.sector_contexto = sector;
};

function obtenerSectoresAleatoriosLocales(cantidad = 10) {
  return [...sectoresCatalogo]
    .sort(() => Math.random() - 0.5)
    .slice(0, cantidad);
}

const cargarOtrosSectores = async () => {
  try {
    loadingSectores.value = true;

    const sugeridosIa = await sugerirSectoresContexto({
      tema: formData.value.tema.trim() || undefined,
      cantidad: 10,
    });

    if (sugeridosIa.length >= 6) {
      sectoresSugeridos.value = sugeridosIa;
      return;
    }

    sectoresSugeridos.value = obtenerSectoresAleatoriosLocales(10);
  } catch (error) {
    console.error("Error al cargar sectores sugeridos:", error);
    sectoresSugeridos.value = obtenerSectoresAleatoriosLocales(10);
  } finally {
    loadingSectores.value = false;
  }
};

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

// ── SUBMIT ──
const handleSubmit = async () => {
  if (!formData.value.tema.trim()) return;
  if (!formData.value.sector_contexto.trim()) return;

  try {
    loadingAnalisis.value = true;

    const inputs = {
      tema: formData.value.tema.trim(),
      sector_contexto: formData.value.sector_contexto.trim(),
      cantidad: formData.value.cantidad,
      // V8: se envía el valor correcto de la etapa (tofu / mofu_a / mofu_b / bofu / auto)
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

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
