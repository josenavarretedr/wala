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

          <!-- ── Imágenes de soporte ── -->
          <div class="mt-3">
            <button
              @click="toggleImgAccordion(item.rawKey)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
            >
              📸 Imágenes de soporte
              <svg
                :class="[
                  'w-3 h-3 transition-transform',
                  imgAccordionOpen[item.rawKey] && 'rotate-180',
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              v-if="imgAccordionOpen[item.rawKey]"
              class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div v-for="style in IMG_STYLES" :key="style.id">
                <!-- Tarjeta header -->
                <button
                  @click="toggleImgCard(item, style.id)"
                  :class="[
                    'w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white rounded-xl hover:shadow-sm transition-all text-left border',
                    style.borderColor,
                    style.hoverBorder,
                  ]"
                >
                  <div
                    class="min-w-0 flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0"
                  >
                    <span
                      :class="[
                        'text-lg leading-none shrink-0 sm:hidden',
                        style.emoji,
                      ]"
                      >{{ style.icono }}</span
                    >
                    <div class="min-w-0">
                      <p
                        :class="[
                          'text-[10px] font-semibold uppercase tracking-wide mb-0',
                          style.labelColor,
                        ]"
                      >
                        {{ style.nombre }}
                      </p>
                      <p class="text-xs font-medium text-gray-800">
                        {{ style.concepto }}
                      </p>
                      <p class="text-[10px] text-gray-500 hidden sm:block">
                        {{ style.descripcion }}
                      </p>
                    </div>
                  </div>
                  <svg
                    :class="[
                      'w-3.5 h-3.5 transition-transform shrink-0',
                      style.chevronColor,
                      imgCardOpen[`${item.rawKey}__${style.id}`] &&
                        'rotate-180',
                    ]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <!-- Card expandible -->
                <div
                  v-if="imgCardOpen[`${item.rawKey}__${style.id}`]"
                  :class="[
                    'mt-1.5 bg-white rounded-xl p-3 border',
                    style.expandedBorder,
                  ]"
                >
                  <!-- Spinner -->
                  <div
                    v-if="generandoImg[`${item.rawKey}__${style.id}`]"
                    class="flex items-center gap-2 py-2"
                  >
                    <div
                      :class="[
                        'animate-spin rounded-full h-3.5 w-3.5 border-b-2',
                        style.spinnerColor,
                      ]"
                    ></div>
                    <span :class="['text-xs font-medium', style.labelColor]"
                      >Generando con IA…</span
                    >
                  </div>
                  <!-- Texto generado -->
                  <p
                    v-else
                    class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap"
                  >
                    {{ imgPromptTexto[`${item.rawKey}__${style.id}`] }}
                  </p>
                  <!-- Botones -->
                  <div
                    v-if="!generandoImg[`${item.rawKey}__${style.id}`]"
                    class="mt-2 flex flex-wrap gap-1.5"
                  >
                    <button
                      @click="regenerarImg(item, style.id)"
                      :class="[
                        'flex-none px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                        style.regenClass,
                      ]"
                      title="Nueva llamada a Grok con el mismo contexto"
                    >
                      ↺ Regenerar
                    </button>
                    <button
                      @click="cambiarDetallesImg(item.rawKey, style.id)"
                      :disabled="!imgPromptBase[`${item.rawKey}__${style.id}`]"
                      class="flex-none px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                      title="Cambia detalles sin nueva llamada a la API"
                    >
                      ✦ Change Details
                    </button>
                    <button
                      @click="copiarImgPrompt(item.rawKey, style.id)"
                      :class="[
                        'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all',
                        imgCopiado[`${item.rawKey}__${style.id}`]
                          ? 'bg-green-100 text-green-700'
                          : style.copyClass,
                      ]"
                    >
                      {{
                        imgCopiado[`${item.rawKey}__${style.id}`]
                          ? "✓ Copiado al portapapeles"
                          : "Copiar prompt"
                      }}
                    </button>
                  </div>
                </div>
              </div>
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

// ════════════════════════════════════════════════════
// ── IMÁGENES DE SOPORTE ──
// ════════════════════════════════════════════════════

const IMG_STYLES = [
  {
    id: "img1",
    icono: "🎬",
    nombre: "Cinematográfica",
    concepto: "Escena documental",
    descripcion: "Realista · 8K · 9:16",
    borderColor: "border-violet-200",
    hoverBorder: "hover:border-violet-400",
    labelColor: "text-violet-700",
    chevronColor: "text-violet-400",
    expandedBorder: "border-violet-100",
    spinnerColor: "border-violet-600",
    regenClass: "bg-violet-50 text-violet-700 hover:bg-violet-100",
    copyClass: "bg-violet-600 text-white hover:bg-violet-700",
  },
  {
    id: "img2",
    icono: "📊",
    nombre: "Infografía",
    concepto: "Visual estructurado",
    descripcion: "Flat design · Datos clave",
    borderColor: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    labelColor: "text-blue-700",
    chevronColor: "text-blue-400",
    expandedBorder: "border-blue-100",
    spinnerColor: "border-blue-600",
    regenClass: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    copyClass: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    id: "img3",
    icono: "✍️",
    nombre: "Handwritten",
    concepto: "Nota a mano",
    descripcion: "Papel · Pizarra · Cuaderno",
    borderColor: "border-amber-200",
    hoverBorder: "hover:border-amber-400",
    labelColor: "text-amber-700",
    chevronColor: "text-amber-400",
    expandedBorder: "border-amber-100",
    spinnerColor: "border-amber-600",
    regenClass: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    copyClass: "bg-amber-600 text-white hover:bg-amber-700",
  },
  {
    id: "img4",
    icono: "🖼️",
    nombre: "Básico",
    concepto: "Objeto / escena simple",
    descripcion: "Stock · Sin personas",
    borderColor: "border-green-200",
    hoverBorder: "hover:border-green-400",
    labelColor: "text-green-700",
    chevronColor: "text-green-400",
    expandedBorder: "border-green-100",
    spinnerColor: "border-green-600",
    regenClass: "bg-green-50 text-green-700 hover:bg-green-100",
    copyClass: "bg-green-600 text-white hover:bg-green-700",
  },
];

// ── Estado reactivo de imágenes ──
const imgAccordionOpen = reactive({});
const imgCardOpen = reactive({});
const generandoImg = reactive({});
const imgPromptBase = reactive({});
const imgPromptTexto = reactive({});
const imgCopiado = reactive({});

// ── Pools: Cinematográfica ──
const cinePlanos = [
  "Plano medio, altura de cintura, lente 35mm",
  "Plano americano, altura de rodillas, lente 50mm",
  "Primer plano enfocado en rostro y manos, lente 85mm",
  "Plano medio corto, tres cuartos de perfil, lente 50mm",
  "Plano detalle alternado: manos en acción y rostro, lente 85mm",
];
const cineMomentos = [
  "a primera hora de la mañana, antes de abrir el negocio",
  "a media mañana, en plena jornada de trabajo",
  "a última hora de la tarde, cerrando el día",
  "al mediodía, revisando resultados del día",
  "temprano en la mañana, preparando el negocio para el día",
];
const cineAngulos = [
  "Cámara ligeramente por debajo del nivel de los ojos, ángulo levemente contrapicado que da autoridad",
  "Cámara a nivel de los ojos, ángulo neutro documental directo",
  "Cámara levemente por encima, ángulo picado suave que muestra el entorno y los productos",
];
const cineLuces = [
  "Sombras suaves que acentúan la tensión en el rostro.",
  "La luz cae de costado creando contraste que refuerza la expresión seria.",
  "Iluminación ligeramente subexpuesta en el fondo, el personaje en primer foco.",
  "Luz que destaca las manos en movimiento, fondo ligeramente desenfocado.",
  "Iluminación equilibrada que transmite claridad y momentum positivo.",
  "Destello suave de luz natural que entra por la ventana, símbolo visual de apertura.",
];
const CINE_CIERRE =
  "Colores vivos y realistas, sin corrección de color artificial. " +
  "Profundidad de campo cinematográfica. " +
  "Estilo documental fotográfico profesional, textura de piel detallada, calidad 8K, sin filtros artificiales. " +
  "Atmósfera auténtica de negocio familiar latinoamericano. Formato vertical 9:16.";

// ── Pools: Infografía ──
const infoLayouts = [
  "Composición vertical con título en bloque superior y 3 elementos en columna debajo",
  "Diseño centrado con dato principal grande al centro y 2 puntos de apoyo laterales",
  "Layout tipo timeline horizontal con 3 pasos conectados por flecha",
  "Grid de 2×2 con ícono y texto corto en cada celda, separadas por líneas finas",
  "Composición asimétrica con elemento visual grande a la izquierda y texto a la derecha",
];
const infoFondos = [
  "Fondo naranja (#F97316) en bloque superior con texto blanco en negrita, área inferior blanca con detalles en gris oscuro",
  "Fondo blanco limpio con tarjetas y bloques de acento sólido naranja (#F97316), texto gris oscuro (#1A1A1A)",
  "Fondo gris muy claro (#F4F4F4) con elementos rectangulares rellenos de naranja (#F97316) y texto blanco dentro de ellos",
  "Fondo naranja degradado de #F97316 a #EA6C00 con íconos y texto completamente en blanco",
];
const infoIconos = [
  "Íconos minimalistas de línea fina estilo Feather Icons, 48px",
  "Íconos geométricos llenos de estilo flat con bordes redondeados",
  "Símbolos de negocio: gráfica de barras, carrito, billetera, reloj analógico",
  "Ilustraciones micro-isométricas de comercio: tienda, caja registradora, inventario",
];

// ── Pools: Handwritten ──
const hwSuperficies = [
  "papel kraft marrón ligeramente arrugado en los bordes con manchas naturales",
  "página de cuaderno cuadriculado con espiral metálica visible en el lateral",
  "pizarra verde oscuro con bordes de madera y residuos de tiza en las esquinas",
  "post-it amarillo sobre superficie de escritorio de madera con veta visible",
  "hoja de libreta artesanal color crema con márgenes marcados en rojo",
];
const hwInstrumentos = [
  "escrito con bolígrafo azul oscuro, letra cursiva presionada de emprendedor",
  "escrito con marcador negro grueso tipo Sharpie, trazos anchos y seguros",
  "escrito con tiza blanca imperfecta, grosor variable por la presión",
  "escrito con lápiz 2B de grafito con pequeñas borraduras y reescrituras visibles",
  "escrito con plumón de pizarra azul y detalles en rojo para enfatizar",
];
const hwElementos = [
  "con una flecha curva dibujada a mano señalando la frase principal",
  "con un subrayado doble hecho a mano bajo la idea más importante",
  "con pequeños dibujos esquemáticos al margen: moneda, flecha ascendente, estrella",
  "con paréntesis y tres signos de exclamación escritos en los extremos de la frase",
  "con un círculo trazado a mano alrededor de la palabra clave central",
];
const hwLuz = [
  "Fotografía cenital con luz natural difusa, sombra suave visible.",
  "Ángulo 3/4 con luz lateral cálida que resalta la textura de la superficie.",
  "Luz natural de ventana que cae oblicuamente sobre la superficie iluminando la escritura.",
];

// ── Pools: Básico ──
const basicoEncuadres = [
  "encuadre cenital limpio sobre superficie clara",
  "ángulo 45° sobre fondo neutro desenfocado",
  "plano frontal centrado con fondo liso de un solo color",
  "ángulo de tres cuartos con profundidad de campo ajustada",
];
const basicoLuz = [
  "luz natural suave y difusa de ventana",
  "iluminación de estudio limpia sin sombras duras",
  "luz natural lateral cálida que resalta texturas",
];
const basicoEstilo = [
  "fotografía de producto estilo editorial, fondo claro, calidad 4K",
  "foto tipo stock profesional, composición minimalista, alta definición",
  "imagen documental simple y limpia, sin texto superpuesto, resolución alta",
];

// ── Estado emocional por sección para cinematográfica ──
const SECTION_CINE_MOOD = {
  hook: {
    emocion: "intriga inicial y curiosidad que invita a seguir",
    postura:
      "postura de alerta, mirada directa a cámara con expresión que engancha",
    accion:
      "el personaje está en su entorno mirando directamente con energía e intensidad",
  },
  caso_validacion: {
    emocion:
      "reconocimiento del problema o validación de experiencia compartida",
    postura:
      "postura ligeramente tensa, expresión de quien enfrenta un desafío conocido y real",
    accion:
      "el personaje observa o interactúa directamente con el problema específico descrito",
  },
  desarrollo: {
    emocion: "concentración activa y determinación en resolver",
    postura:
      "postura enfocada, manos en movimiento, energía visible de quien está en acción",
    accion:
      "el personaje usa activamente la herramienta o ejecuta la solución descrita en la sección",
  },
  micro_accion: {
    emocion: "micro-cambio positivo, momento de claridad y pequeña victoria",
    postura:
      "postura en transición, cuerpo orientándose hacia adelante con alivio",
    accion:
      "el personaje ejecuta el pequeño paso concreto mencionado, gesto preciso y deliberado",
  },
  cta: {
    emocion: "resolución positiva, confianza y llamada a unirse",
    postura: "postura abierta y confiada, mirada frontal que invita",
    accion:
      "el personaje muestra el resultado obtenido o mira con convicción hacia el espectador",
  },
};

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

function ensamblarCine(base) {
  const angulo = rnd(cineAngulos);
  const plano = rnd(cinePlanos);
  const momento = rnd(cineMomentos);
  const luz = rnd(cineLuces);
  return `${base}\n\n${angulo}. ${plano}. La escena ocurre ${momento}. ${luz}\n\n${CINE_CIERRE}`;
}

function ensamblarInfo(base) {
  const layout = rnd(infoLayouts);
  const fondo = rnd(infoFondos);
  const iconos = rnd(infoIconos);
  return `${base}\n\n${layout}. ${fondo}. ${iconos}. Tipografía sans-serif moderna (Inter o similar), jerarquía clara. Sin fotografías de personas. Formato vertical 9:16, apto para Instagram/TikTok.`;
}

function ensamblarHW(base) {
  const superficie = rnd(hwSuperficies);
  const instrumento = rnd(hwInstrumentos);
  const elementos = rnd(hwElementos);
  const luz = rnd(hwLuz);
  return `${base}\n\nEscenario: ${superficie}, ${instrumento}, ${elementos}. ${luz} Formato vertical 9:16, estilo fotografía documental auténtica de emprendedor.`;
}

function ensamblarBasico(base) {
  const encuadre = rnd(basicoEncuadres);
  const luz = rnd(basicoLuz);
  const estilo = rnd(basicoEstilo);
  return `${base}\n\n${encuadre}, ${luz}. ${estilo}. Sin personas. Formato vertical 9:16.`;
}

// ── Toggle acordeón principal ──
function toggleImgAccordion(rawKey) {
  imgAccordionOpen[rawKey] = !imgAccordionOpen[rawKey];
}

// ── Toggle tarjeta de estilo (cierra las otras del mismo rawKey) ──
async function toggleImgCard(item, styleId) {
  const k = `${item.rawKey}__${styleId}`;
  IMG_STYLES.forEach((s) => {
    if (s.id !== styleId) imgCardOpen[`${item.rawKey}__${s.id}`] = false;
  });
  const abriendo = !imgCardOpen[k];
  imgCardOpen[k] = abriendo;
  if (abriendo && !imgPromptBase[k]) {
    await llamarGrokImg(item, styleId);
  }
}

async function regenerarImg(item, styleId) {
  await llamarGrokImg(item, styleId);
}

function cambiarDetallesImg(rawKey, styleId) {
  const k = `${rawKey}__${styleId}`;
  const base = imgPromptBase[k];
  if (!base) return;
  if (styleId === "img1") imgPromptTexto[k] = ensamblarCine(base);
  else if (styleId === "img2") imgPromptTexto[k] = ensamblarInfo(base);
  else if (styleId === "img3") imgPromptTexto[k] = ensamblarHW(base);
  else imgPromptTexto[k] = ensamblarBasico(base);
}

async function copiarImgPrompt(rawKey, styleId) {
  const k = `${rawKey}__${styleId}`;
  const texto = imgPromptTexto[k];
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
    imgCopiado[k] = true;
    setTimeout(() => {
      imgCopiado[k] = false;
    }, 2500);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    imgCopiado[k] = true;
    setTimeout(() => {
      imgCopiado[k] = false;
    }, 2500);
  }
}

// ── Llamada a Grok para generar prompt de imagen de soporte ──
async function llamarGrokImg(item, styleId) {
  if (!props.videoContext) return;
  const v = props.videoContext;
  const k = `${item.rawKey}__${styleId}`;
  const mood = SECTION_CINE_MOOD[item.rawKey] || SECTION_CINE_MOOD.desarrollo;
  const seccionTexto = item.text || "";

  let systemMsg = "";
  let userMsg = "";

  if (styleId === "img1") {
    systemMsg =
      "Eres un director de arte especializado en fotografía documental latinoamericana para redes sociales. " +
      "Describes escenas fotográficas precisas, visuales y auténticas para generadores de imágenes IA. " +
      "Idioma: español.";
    userMsg = `Genera una descripción de escena fotográfica hiperrealista para contenido de redes sociales vertical.

REGLAS FIJAS:
- El personaje SIEMPRE es el dueño o dueña del negocio: latinoamericano/a, 25-40 años, emprendedor/a familiar. NUNCA empleados ni clientes.
- Está en su propio local comercial con elementos específicos y concretos del rubro.
- La escena refleja directamente este momento exacto del guion.
- NO menciones lentes, mm, ángulos de cámara, iluminación técnica ni encuadres. Solo la escena narrativa.
- Máximo 4 oraciones densas y visuales. Sin listas ni viñetas.

DATOS DEL VIDEO:
- Tema: ${v.tema || "—"}
- Negocio: ${v.sector_contexto || "negocio familiar latinoamericano"}
- Sección del guion: ${item.label}
- Texto exacto de esta sección: "${seccionTexto}"

ESTADO EMOCIONAL DE LA TOMA:
- Emoción: ${mood.emocion}
- Postura del personaje: ${mood.postura}
- Acción concreta: ${mood.accion}

Describe con precisión: quién es la persona (aspecto físico específico, ropa característica de su rubro), cómo es exactamente su local con objetos concretos del sector, qué está haciendo en ese momento preciso relacionado con "${seccionTexto}", y qué transmiten su postura y rostro.`;
  } else if (styleId === "img2") {
    systemMsg =
      "Eres un diseñador UX/UI especializado en infografías para redes sociales. " +
      "Describes composiciones visuales precisas, modernas y claras para generadores de imágenes IA. " +
      "Idioma: español.";
    userMsg = `Genera una descripción detallada de una infografía digital vertical para redes sociales (formato 9:16).

DATOS DEL CONTENIDO:
- Tema del video: ${v.tema || "—"}
- Negocio/Sector: ${v.sector_contexto || "negocio familiar latinoamericano"}
- Sección del guion: ${item.label}
- Texto de esta sección: "${seccionTexto}"

REGLAS DE DISEÑO:
- Extrae los 2-3 datos, pasos o conceptos clave de ese texto de sección.
- Diseño flat moderno, minimalista, legible a distancia.
- Tipografía sans-serif en jerarquía clara: titular grande, subtítulos medianos, texto secundario pequeño.
- Sin fotografías de personas reales. Solo íconos, formas geométricas, flechas y texto.
- Colores: naranja (#F97316, oklch(70.5% 0.213 47.604)) como color PRIMARIO dominante de la marca. Úsalo en fondos, bloques de color, títulos y elementos destacados. Blanco (#FFFFFF) para texto sobre fondo naranja y para áreas limpias. Gris muy oscuro (#1A1A1A) para texto secundario. Violeta (#7C3AED) solo como acento mínimo si aporta contraste, nunca como color principal.
- El mensaje principal debe poder leerse en 3 segundos.
- Formato vertical 9:16. Apto para reel o story de Instagram/TikTok.

Describe: la estructura visual exacta (cómo se organiza la pantalla de arriba a abajo), los elementos gráficos específicos presentes, los textos que aparecerán en cada área de la composición, y el estilo visual general.
Máximo 5 oraciones densas. Sin listas ni viñetas. Sin mencionar herramientas de diseño.`;
  } else if (styleId === "img3") {
    systemMsg =
      "Eres un director de arte especializado en contenido orgánico y autenticidad visual para pequeños negocios latinoamericanos. " +
      "Idioma: español.";
    userMsg = `Genera una descripción de una imagen estilo nota escrita a mano para redes sociales vertical.

DATOS DEL CONTENIDO:
- Tema del video: ${v.tema || "—"}
- Negocio/Sector: ${v.sector_contexto || "negocio familiar latinoamericano"}
- Sección del guion: ${item.label}
- Texto de esta sección: "${seccionTexto}"

REGLAS DE ESTILO:
- Extrae LA frase o idea más importante de ese texto de sección (máximo 12-15 palabras).
- El texto principal debe escribirse a mano sobre una superficie física real.
- Superficies válidas: papel kraft, cuaderno, libreta artesanal, pizarra de negocio, post-it, servilleta.
- El entorno debe verse auténtico: una pequeña parte del negocio visible alrededor en el fondo.
- Sensación: nota real de un emprendedor latinoamericano, no diseñada — completamente auténtica.
- Pueden haber elementos dibujados a mano alrededor: flechas, estrellas, subrayados, pequeños bocetos esquemáticos.
- Formato vertical 9:16. Fotografía cenital o ángulo 3/4.

Describe: la superficie exacta elegida, la frase concreta que está escrita (extráela del texto de la sección), los elementos dibujados a mano presentes, el entorno visible de fondo, la iluminación y el encuadre.
Máximo 4 oraciones. Muy visual y específico. Sin listas.`;
  } else {
    systemMsg =
      "Eres un fotógrafo de producto y entornos comerciales especializado en imágenes simples y limpias para redes sociales. " +
      "Idioma: español.";
    userMsg = `Genera la descripción de una imagen fotográfica muy simple y limpia para acompañar este fragmento de guion en redes sociales.

DATOS DEL CONTENIDO:
- Tema del video: ${v.tema || "—"}
- Negocio/Sector: ${v.sector_contexto || "negocio familiar latinoamericano"}
- Sección del guion: ${item.label}
- Texto de esta sección: "${seccionTexto}"

REGLAS:
- SIN personas en la imagen.
- Fotografiar el objeto, producto, herramienta o elemento del negocio más directamente relacionado con lo que dice ese texto.
- Fondo limpio y neutro: blanco, gris claro, o superficie natural del negocio.
- Composición simple, centrada y limpia. Sin texto superpuesto.
- Una sola idea visual, fácil de leer a primera vista.
- Calidad fotográfica alta. Formato vertical 9:16.

Describe con precisión: qué objeto o elementos específicos aparecen (relacionados directamente con "${seccionTexto}"), el fondo y superficie donde están, la posición y orden visual, y la sensación que transmite la imagen.
Máximo 3 oraciones directas. Sin listas. Sin personas.`;
  }

  try {
    generandoImg[k] = true;
    const { OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: import.meta.env.VITE_XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
      dangerouslyAllowBrowser: true,
    });
    const resp = await client.chat.completions.create({
      model: import.meta.env.VITE_GROK_MODEL || "grok-3-mini",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      max_tokens: 450,
      temperature: 0.85,
    });
    const base = resp.choices[0].message.content.trim();
    imgPromptBase[k] = base;
    if (styleId === "img1") imgPromptTexto[k] = ensamblarCine(base);
    else if (styleId === "img2") imgPromptTexto[k] = ensamblarInfo(base);
    else if (styleId === "img3") imgPromptTexto[k] = ensamblarHW(base);
    else imgPromptTexto[k] = ensamblarBasico(base);
  } catch (err) {
    console.error(`Error Grok img soporte ${k}:`, err);
  } finally {
    generandoImg[k] = false;
  }
}
</script>
