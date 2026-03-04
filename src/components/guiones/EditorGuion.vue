<template>
  <div v-if="timelineItems.length > 0" class="relative">
    <!-- TIMELINE LINE -->
    <div
      class="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-orange-300 to-green-300 rounded-full"
    />

    <div class="space-y-4">
      <div
        v-for="(item, idx) in timelineItems"
        :key="item.sortKey + '-' + idx"
        class="relative flex gap-4"
      >
        <!-- Dot en el timeline -->
        <div class="relative z-10 flex-shrink-0">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm',
              item.dotColor,
            ]"
          >
            {{ item.icon }}
          </div>
        </div>

        <!-- Contenido: Sección normal -->
        <div
          v-if="item.type === 'section'"
          :class="['flex-1 rounded-xl border p-4 mb-1', item.cardClass]"
        >
          <!-- Cabecera -->
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span
              :class="[
                'px-2 py-0.5 rounded text-xs font-mono font-bold',
                item.timestampClass,
              ]"
            >
              {{ item.timestamp }}
            </span>
            <span class="text-xs font-semibold text-gray-700">{{
              item.label
            }}</span>
            <span
              v-if="item.badge"
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                item.badgeClass,
              ]"
            >
              {{ item.badge }}
            </span>
            <!-- Indicador de edición pendiente -->
            <span
              v-if="item.hasLocalEdit"
              class="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-violet-100 text-violet-600"
            >
              editado
            </span>
          </div>

          <!-- Texto (usa edición local si existe) -->
          <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {{ item.text }}
          </p>

          <!-- ── Zona regenerable (solo caso_validacion y desarrollo) ── -->
          <div v-if="item.canRegenerate" class="mt-3">
            <!-- Textarea editable (aparece tras generar) -->
            <div v-if="item.showEditor" class="mb-2">
              <label
                class="block text-[11px] font-semibold text-gray-500 uppercase mb-1"
              >
                Nueva versión — edita antes de guardar
              </label>
              <textarea
                :value="editTexts[item.rawKey]"
                @input="
                  onTextInput(item.rawKey, $event.target.value, item.timestamp)
                "
                rows="4"
                class="w-full text-sm text-gray-800 bg-white border border-violet-300 rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-violet-400 leading-relaxed"
                placeholder="Texto generado aparecerá aquí..."
              />
            </div>

            <!-- Botones de acción -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Botón Sparks: regenerar -->
              <button
                @click="regenerarSeccion(item.rawKey, item.timestamp)"
                :disabled="regenerating[item.rawKey]"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  regenerating[item.rawKey]
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 hover:border-violet-300',
                ]"
              >
                <!-- Sparks icon (Iconoir) -->
                <svg
                  v-if="!regenerating[item.rawKey]"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M8 15C12.8747 15 15 12.8747 15 8C15 12.8747 17.1253 15 22 15C17.1253 15 15 17.1253 15 22C15 17.1253 12.8747 15 8 15Z"
                  />
                  <path
                    d="M2 6.5C5.13376 6.5 6.5 5.13376 6.5 2C6.5 5.13376 7.86624 6.5 11 6.5C7.86624 6.5 6.5 7.86624 6.5 11C6.5 7.86624 5.13376 6.5 2 6.5Z"
                  />
                </svg>
                <!-- Spinner -->
                <svg
                  v-else
                  class="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                {{
                  regenerating[item.rawKey]
                    ? "Generando..."
                    : "Regenerar con IA"
                }}
              </button>

              <!-- Botón descartar (solo si hay edición local) -->
              <button
                v-if="item.hasLocalEdit"
                @click="descartarEdicion(item.rawKey)"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Descartar
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido: Micro-hook intercalado -->
        <div
          v-else-if="item.type === 'microhook'"
          class="flex-1 flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-1"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-xs font-mono font-bold text-orange-600 bg-orange-100 px-1.5 rounded"
              >
                {{ item.timestamp }}
              </span>
              <span class="text-xs text-gray-500">{{ item.tipo }}</span>
              <span
                class="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-200 text-orange-700"
              >
                micro-hook
              </span>
            </div>
            <p class="text-sm text-gray-800 font-medium">"{{ item.texto }}"</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-sm text-gray-400 text-center py-6">
    No hay guion disponible
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";

const props = defineProps({
  guionCompleto: { type: Object, default: null },
  microHooks: { type: Array, default: () => [] },
  // Contexto completo del video para la llamada a Grok
  videoContext: { type: Object, default: null },
});

const emit = defineEmits(["section-updated"]);

// ── Claves que permiten regeneración ──
const REGENERABLE_KEYS = ["caso_validacion", "desarrollo"];

// ── Estado de regeneración por sección ──
const regenerating = reactive({ caso_validacion: false, desarrollo: false });

// ── Texto local editado (null = sin cambio, string = versión editada CON prefijo [Xs]) ──
const localRaw = reactive({ caso_validacion: null, desarrollo: null });

// ── Texto en el textarea (SIN prefijo, para que sea legible) ──
const editTexts = reactive({ caso_validacion: "", desarrollo: "" });

// ── Mostrar textarea ──
const showEditor = reactive({ caso_validacion: false, desarrollo: false });

// ── Helpers ──
const extractTimestamp = (text) => {
  if (!text) return "";
  const m = text.match(/\[([^\]]+)\]/);
  return m ? m[1] : "";
};

const stripTimestamp = (text) => {
  if (!text) return "";
  return text.replace(/\[([^\]]+)\]\s*/, "").trim();
};

const parseTimestampToSeconds = (ts) => {
  if (!ts) return 999;
  const str = String(ts).replace(/s$/i, "").trim();
  const rangeMatch = str.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) return parseInt(rangeMatch[1], 10);
  const num = parseInt(str, 10);
  return isNaN(num) ? 999 : num;
};

// ── Secciones del guion ──
const SECTION_DEFS = [
  {
    key: "hook",
    label: "Hook Inicial",
    icon: "🎣",
    dotColor: "bg-purple-600",
    cardClass: "bg-purple-50 border-purple-200",
    timestampClass: "bg-purple-100 text-purple-700",
    badge: null,
    badgeClass: "",
  },
  {
    key: "caso_validacion",
    label: "Caso / Validación",
    icon: "💼",
    dotColor: "bg-gray-500",
    cardClass: "bg-gray-50 border-gray-200",
    timestampClass: "bg-gray-100 text-gray-600",
    badge: "opcional",
    badgeClass: "bg-gray-200 text-gray-500",
  },
  {
    key: "desarrollo",
    label: "Desarrollo",
    icon: "📖",
    dotColor: "bg-blue-500",
    cardClass: "bg-blue-50 border-blue-200",
    timestampClass: "bg-blue-100 text-blue-700",
    badge: null,
    badgeClass: "",
  },
  {
    key: "micro_accion",
    label: "Micro Acción",
    icon: "⚡",
    dotColor: "bg-yellow-500",
    cardClass: "bg-yellow-50 border-yellow-200",
    timestampClass: "bg-yellow-100 text-yellow-700",
    badge: null,
    badgeClass: "",
  },
  {
    key: "cta",
    label: "CTA",
    icon: "🎯",
    dotColor: "bg-green-500",
    cardClass: "bg-green-50 border-green-200",
    timestampClass: "bg-green-100 text-green-700",
    badge: null,
    badgeClass: "",
  },
];

// ── Timeline combinado ──
const timelineItems = computed(() => {
  if (!props.guionCompleto) return [];

  const sectionItems = SECTION_DEFS.filter(
    (def) => props.guionCompleto[def.key],
  ).map((def) => {
    const canRegen = REGENERABLE_KEYS.includes(def.key);
    const hasLocalEdit = canRegen && localRaw[def.key] !== null;
    const ts = extractTimestamp(props.guionCompleto[def.key]); // timestamp siempre del original
    return {
      type: "section",
      ...def,
      timestamp: ts,
      // El párrafo principal siempre muestra el texto original (guardado)
      text: stripTimestamp(props.guionCompleto[def.key]),
      sortKey: parseTimestampToSeconds(ts),
      canRegenerate: canRegen,
      hasLocalEdit,
      showEditor: canRegen && showEditor[def.key],
      rawKey: def.key,
    };
  });

  const hookItems =
    props.microHooks && Array.isArray(props.microHooks)
      ? props.microHooks.map((mh, idx) => ({
          type: "microhook",
          numero: mh.numero ?? idx + 1,
          tipo: mh.tipo || "",
          texto: mh.texto || "",
          timestamp: mh.timestamp || "",
          icon: `${mh.numero ?? idx + 1}`,
          dotColor: "bg-orange-400",
          sortKey: parseTimestampToSeconds(mh.timestamp),
        }))
      : [];

  return [...sectionItems, ...hookItems].sort((a, b) => a.sortKey - b.sortKey);
});

// ── Handler del textarea ──
function onTextInput(key, rawValue, originalTimestamp) {
  editTexts[key] = rawValue;
  const withTs = originalTimestamp
    ? `[${originalTimestamp}] ${rawValue}`
    : rawValue;
  localRaw[key] = withTs;
  emit("section-updated", { key, text: withTs });
}

// ── Descartar edición ──
function descartarEdicion(key) {
  localRaw[key] = null;
  editTexts[key] = "";
  showEditor[key] = false;
  // Restaurar al texto original en el padre
  if (props.guionCompleto?.[key]) {
    emit("section-updated", { key, text: props.guionCompleto[key] });
  }
}

// ── Llamada a Grok para regenerar sección ──
async function regenerarSeccion(key, originalTimestamp) {
  if (!props.videoContext) {
    console.warn("EditorGuion: videoContext no provisto");
    return;
  }
  const v = props.videoContext;
  const gc = v.guion_completo || {};
  const strip = (t) => (t || "").replace(/\[.*?\]\s*/, "").trim();

  const esDirecta = v.narrativa === "directa";
  const keyLabel =
    key === "caso_validacion"
      ? "CASO/VALIDACIÓN [5-25s]"
      : "DESARROLLO [25-50s]";

  const reglaSeccion =
    key === "caso_validacion"
      ? esDirecta
        ? "2-3 oraciones que interpelan al espectador directamente desde la observación general. SIN conectores causales (PERO/ENTONCES/POR ESO). Tono rápido e interpelador."
        : "3-4 oraciones con story arc causal. Historia real de emprendedor específico (NO 'zona urbana' — describe su perfil concreto). Usa conectores PERO / ENTONCES / POR ESO."
      : esDirecta
        ? "4-5 oraciones cortas y directas, sin conectores causales. OBLIGATORIO mencionar WALA por nombre como herramienta solución. Lenguaje cotidiano del dueño del negocio."
        : "4-6 oraciones con conectores PERO / ENTONCES / POR ESO. OBLIGATORIO mencionar WALA por nombre. Lenguaje cotidiano, sin tecnicismos corporativos.";

  const prompt = `Eres un experto en guiones para redes sociales. Debes regenerar ÚNICAMENTE la sección "${keyLabel}" del siguiente guion.

## DATOS DEL VIDEO
- Tema: ${v.tema}
- Sector/Contexto: ${v.sector_contexto || "negocio familiar latinoamericano"}
- Ruta: ${v.ruta || "—"}
- Tipo de contenido: ${v.tipo_contenido || "—"}
- Narrativa: ${v.narrativa || "—"}
- Voz: ${v.voz || "A"} ${(v.voz || "A") === "A" ? "(José Navarrete — primera persona, casos reales desde experiencia propia)" : "(WALA — segunda persona, directo al beneficio funcional)"}

## GUION COMPLETO ACTUAL (mantén coherencia con TODO esto)
- Hook [0-5s]: ${strip(gc.hook) || "—"}
- Caso/Validación [5-25s]: ${strip(gc.caso_validacion) || "—"}
- Desarrollo [25-50s]: ${strip(gc.desarrollo) || "—"}
- Micro Acción [50-58s]: ${strip(gc.micro_accion) || "—"}
- CTA [58-60s]: ${strip(gc.cta) || "—"}

## SECCIÓN A REGENERAR: ${keyLabel}
${reglaSeccion}

## REGLAS OBLIGATORIAS
- Español neutro latinoamericano. PROHIBIDO voseo argentino (tenés→tienes, hacé→haz, sabés→sabes, etc.)
- Mantener el mismo emprendedor y situación presentes en el guion actual
- El texto debe sonar completamente natural al leerlo en voz alta
- NO incluir el prefijo de tiempo [5-25s] ni [25-50s] en tu respuesta — solo el texto puro
- ${key === "desarrollo" ? "CRITICO: mencionar WALA por nombre. NUNCA decir 'una app', 'una herramienta' ni 'un sistema' genérico." : "Coherente con el hook anterior y el desarrollo posterior."}

## RESPONDE SOLO EN JSON:
{"texto": "El texto completo de la sección aquí, sin prefijo de tiempo."}`;

  try {
    regenerating[key] = true;
    const { OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: import.meta.env.VITE_XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
      dangerouslyAllowBrowser: true,
    });
    const resp = await client.chat.completions.create({
      model: import.meta.env.VITE_GROK_MODEL || "grok-3-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un generador de guiones para redes sociales. Produces texto hablado natural, coherente y específico. Idioma: español neutro latinoamericano.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 450,
      temperature: 0.72,
    });

    const result = JSON.parse(resp.choices[0].message.content.trim());
    const nuevoTexto = (result.texto || "").trim();

    // Guardar texto en textarea (sin prefijo) y en raw (con prefijo)
    editTexts[key] = nuevoTexto;
    const withTs = originalTimestamp
      ? `[${originalTimestamp}] ${nuevoTexto}`
      : nuevoTexto;
    localRaw[key] = withTs;
    showEditor[key] = true;

    // Notificar al padre
    emit("section-updated", { key, text: withTs });
  } catch (err) {
    console.error(`Error regenerando sección ${key}:`, err);
  } finally {
    regenerating[key] = false;
  }
}
</script>
