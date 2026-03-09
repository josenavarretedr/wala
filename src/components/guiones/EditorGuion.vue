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

          <!-- ── 📸 Imágenes de soporte ── -->
          <div class="mt-3">
            <!-- Trigger acordeón -->
            <button
              @click="toggleImgAccordion(item.rawKey)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
            >
              📸 Imágenes de soporte
              <svg
                :class="[
                  'w-3 h-3 transition-transform duration-200',
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

            <!-- Contenido acordeón -->
            <div v-if="imgAccordionOpen[item.rawKey]" class="mt-2">
              <!-- Grid: 1 col mobile, 2 col sm -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="style in IMG_STYLES" :key="style.id">
                  <!-- Tarjeta toggle -->
                  <button
                    @click="
                      toggleImgCard(
                        item.rawKey,
                        style.id,
                        item.text,
                        item.label,
                      )
                    "
                    :class="[
                      'w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white rounded-xl hover:shadow-sm transition-all text-left border',
                      style.borderColor,
                      style.hoverBorder,
                    ]"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-xl leading-none shrink-0">{{
                        style.emoji
                      }}</span>
                      <div class="min-w-0">
                        <p
                          :class="[
                            'text-[10px] font-semibold uppercase tracking-wide',
                            style.labelColor,
                          ]"
                        >
                          {{ style.nombre }}
                        </p>
                        <p
                          class="text-xs font-medium text-gray-800 leading-tight"
                        >
                          {{ style.concepto }}
                        </p>
                        <p class="text-[10px] text-gray-400 hidden sm:block">
                          {{ style.descripcion }}
                        </p>
                      </div>
                    </div>
                    <svg
                      :class="[
                        'w-3.5 h-3.5 transition-transform duration-200 shrink-0',
                        style.chevronColor,
                        imgCardOpen[item.rawKey] === style.id && 'rotate-180',
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

                  <!-- Card expandida (solo 1 activa por sección) -->
                  <div
                    v-if="imgCardOpen[item.rawKey] === style.id"
                    :class="[
                      'mt-1.5 bg-white rounded-xl p-3 border',
                      style.expandedBorder,
                    ]"
                  >
                    <!-- Spinner -->
                    <div
                      v-if="imgGenerando[`${item.rawKey}__${style.id}`]"
                      class="flex items-center gap-2 py-3"
                    >
                      <div
                        :class="[
                          'animate-spin rounded-full h-4 w-4 border-b-2',
                          style.spinnerColor,
                        ]"
                      ></div>
                      <span :class="['text-xs font-medium', style.labelColor]"
                        >Generando con IA…</span
                      >
                    </div>

                    <!-- Texto prompt generado -->
                    <p
                      v-else
                      class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap"
                    >
                      {{ imgPromptTexto[`${item.rawKey}__${style.id}`] }}
                    </p>

                    <!-- Botones acción -->
                    <div
                      v-if="!imgGenerando[`${item.rawKey}__${style.id}`]"
                      class="mt-3 flex flex-wrap gap-1.5"
                    >
                      <button
                        @click="
                          regenerarImg(
                            item.rawKey,
                            style.id,
                            item.text,
                            item.label,
                          )
                        "
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
                        :disabled="
                          !imgPromptBase[`${item.rawKey}__${style.id}`]
                        "
                        class="flex-none px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                        title="Cambia plano/layout/superficie sin nueva llamada a la API"
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
          <!-- fin 📸 -->
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
    const { httpsCallable } = await import("firebase/functions");
    const { functions } = await import("@/firebaseInit");
    const grokProxy = httpsCallable(functions, "grokProxy");
    const resp = await grokProxy({
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

    const result = JSON.parse((resp.data.content || "{}").trim());
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
// IMÁGENES DE SOPORTE
// ════════════════════════════════════════════════════

// ─ Definición de estilos ─
const IMG_STYLES = [
  {
    id: "cine",
    emoji: "🎬",
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
    id: "info",
    emoji: "📊",
    nombre: "Infografía",
    concepto: "Visual estructurado",
    descripcion: "Flat design · Naranja marca",
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
    id: "hand",
    emoji: "✍️",
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
    id: "basic",
    emoji: "🖼️",
    nombre: "Básica",
    concepto: "Objeto / entorno simple",
    descripcion: "Sin personas · Producto",
    borderColor: "border-green-200",
    hoverBorder: "hover:border-green-400",
    labelColor: "text-green-700",
    chevronColor: "text-green-400",
    expandedBorder: "border-green-100",
    spinnerColor: "border-green-600",
    regenClass: "bg-green-50 text-green-700 hover:bg-green-100",
    copyClass: "bg-green-600 text-white hover:bg-green-700",
  },
  {
    id: "iso",
    emoji: "🏗️",
    nombre: "Isométrica",
    concepto: "Diagrama vectorial",
    descripcion: "Flat 2D · Isométrico · Gestión",
    borderColor: "border-yellow-200",
    hoverBorder: "hover:border-yellow-400",
    labelColor: "text-yellow-700",
    chevronColor: "text-yellow-400",
    expandedBorder: "border-yellow-100",
    spinnerColor: "border-yellow-600",
    regenClass: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
    copyClass: "bg-yellow-600 text-white hover:bg-yellow-700",
  },
];

// ─ Mood emocional por sección (Cinematográfica) ─
const SECTION_MOOD = {
  hook: "intriga y tensión inicial — mirada directa a cámara, expresión que engancha y genera curiosidad inmediata",
  caso_validacion:
    "reconocimiento del problema — expresión auténtica de preocupación, postura ligeramente tensa, mirada fija en el problema concreto",
  desarrollo:
    "concentración en acción — manos en movimiento, enfoque y determinación visibles, energía de quien está resolviendo activamente",
  micro_accion:
    "micro-momento de cambio — postura en transición, gesto pequeño pero deliberado, alivio naciente en el rostro",
  cta: "resolución positiva — expresión abierta y confiada, postura relajada, gesto de invitación o satisfacción con el resultado",
};

// ─ Pools Cinematográfica ─
const cinePlanos = [
  "Plano medio, altura de cintura, lente 35mm",
  "Plano americano, altura de rodillas, lente 50mm",
  "Primer plano de rostro y manos en acción, lente 85mm",
  "Plano medio corto, tres cuartos de perfil, lente 50mm",
  "Plano detalle alternado: manos y rostro, lente 85mm",
];
const cineMomentos = [
  "a primera hora de la mañana, antes de abrir el negocio",
  "a media mañana, en plena jornada de trabajo",
  "a última hora de la tarde, cerrando el día",
  "al mediodía, revisando resultados del día",
];
const cineAngulos = [
  "Cámara ligeramente por debajo del nivel de los ojos, ángulo contrapicado que da autoridad",
  "Cámara a nivel de los ojos, ángulo neutro documental directo",
  "Cámara levemente por encima, picado suave que muestra entorno y productos",
];
const cineLuces = [
  "Sombras suaves que acentúan la expresión del personaje.",
  "Luz lateral que crea contraste y refuerza la emotividad de la escena.",
  "Iluminación ligeramente subexpuesta en el fondo, el personaje en primer foco.",
  "Luz que destaca las manos en movimiento, fondo ligeramente desenfocado.",
  "Iluminación equilibrada que transmite claridad y momentum positivo.",
  "Destello suave de luz natural desde ventana, símbolo visual de apertura.",
];
const CINE_CIERRE =
  "Colores vivos y realistas, sin corrección de color artificial. Profundidad de campo cinematográfica. Estilo documental fotográfico profesional, textura de piel detallada, calidad 8K, sin filtros artificiales. Atmósfera auténtica de negocio familiar latinoamericano. Formato vertical 9:16.";

// ─ Pools Infografía ─
const infoLayouts = [
  "Layout de bloques apilados verticalmente con separadores naranjas (#F97316)",
  "Columna única con tarjetas flotantes de acento naranja sólido (#F97316)",
  "Dato central grande en el tercio superior y 2-3 puntos de apoyo debajo",
  "Lista vertical con íconos naranjas (#F97316) a la izquierda y texto a la derecha",
];
const infoFondos = [
  "Fondo blanco con header naranja #F97316 sólido en el tercio superior y contenido en gris oscuro",
  "Fondo naranja #F97316 degradado a #EA6C00 con todo el contenido en blanco",
  "Fondo gris muy claro #F5F5F5 con tarjetas de acento naranja #F97316 rellenos",
  "Fondo blanco puro con elementos, bordes y separadores naranjas #F97316",
];

// ─ Pools Handwritten ─
const handSuperficies = [
  "papel kraft rugoso de 120g con textura visible y bordes naturalmente irregulares",
  "libreta de campo abierta con espiral metálico visible al borde izquierdo",
  "pizarra negra escolar con marco de madera y residuos de tiza en las esquinas",
  "cuaderno cuadriculado, páginas ligeramente amarillentas por el uso",
  "post-it amarillo sobre superficie de escritorio de madera con veta natural visible",
];
const handMarcadores = [
  "bolígrafo azul de punta media, trazo fluido con presión variable que denota autenticidad",
  "marcador negro grueso tipo Sharpie, trazos anchos y seguros",
  "tiza blanca imperfecta sobre pizarra, grosor variable por la presión",
  "lápiz 2B de grafito con pequeñas borraduras y reescrituras visibles",
];
const handExtras = [
  "una flecha curva dibujada a mano señalando la frase principal",
  "subrayado doble hecho a mano bajo la idea más importante",
  "pequeños dibujos esquemáticos al margen: moneda, flecha ascendente, estrella",
  "un círculo trazado a mano alrededor de la palabra clave central",
  "sin elementos extra — solo el texto limpio sobre la superficie",
];

// ─ Pools Básica ─
const basicEncuadres = [
  "encuadre cenital directo, objeto centrado con sombra suave debajo",
  "encuadre 3/4 frontal levemente elevado, fondo liso neutro",
  "encuadre lateral a 90°, fondo degradado de blanco a gris claro",
  "encuadre macro de detalle del objeto, fondo completamente desenfocado",
];
const basicLuz = [
  "luz natural lateral difusa desde ventana, sin sombras duras",
  "luz de estudio suave con softbox frontal, sombras controladas y suaves",
  "luz natural cenital en exterior nublado, iluminación plana y uniforme",
];
const basicEstilo = [
  "fotografía de producto clean estilo editorial de alta calidad, 8K",
  "fotografía flat lay con elementos complementarios del negocio alrededor",
  "fotografía de entorno comercial con el objeto en contexto real del negocio",
];

// ─ Pools Isométrica ─
const isoFondos = [
  "fondo amarillo vibrante #FFD60A sólido",
  "fondo azul cielo claro #E0F2FE sólido",
  "fondo verde menta suave #ECFDF5 sólido",
  "fondo crema cálido #FFFBEB sólido",
];
const isoElementos = [
  "íconos flotantes de alerta y signo de exclamación en rojo vivo",
  "globos de texto con cifras de porcentaje y flechas ascendentes",
  "cajas y paquetes apilados con etiquetas de precio",
  "lupas y documentos con check verde distribuidos alrededor",
  "monedas y billetes pequeños flotando alrededor del personaje",
];

// ─ Estado reactivo ─
const imgAccordionOpen = reactive({});
const imgCardOpen = reactive({}); // rawKey → styleId activo | null
const imgGenerando = reactive({}); // 'rawKey__styleId' → bool
const imgPromptBase = reactive({}); // 'rawKey__styleId' → texto base Grok
const imgPromptTexto = reactive({}); // 'rawKey__styleId' → texto ensamblado
const imgCopiado = reactive({}); // 'rawKey__styleId' → bool

// ─ Helper random ─
const rndPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─ Funciones de ensamblado (base + pools) ─
function ensamblarCine(base) {
  const a = rndPick(cineAngulos),
    p = rndPick(cinePlanos),
    m = rndPick(cineMomentos),
    l = rndPick(cineLuces);
  return `${base}\n\n${a}. ${p}. La escena ocurre ${m}. ${l}\n\n${CINE_CIERRE}`;
}
function ensamblarInfo(base) {
  return `${base}\n\n${rndPick(infoLayouts)}. ${rndPick(infoFondos)}. Tipografía sans-serif moderna, jerarquía clara. Sin fotografías de personas. Formato vertical 9:16, apto para reel o story de Instagram/TikTok.`;
}
function ensamblarHand(base) {
  return `${base}\n\nEscenario: ${rndPick(handSuperficies)}, ${rndPick(handMarcadores)}, ${rndPick(handExtras)}. Fotografía cenital o ángulo 3/4 con luz natural cálida. Formato vertical 9:16, estilo documental auténtico.`;
}
function ensamblarBasic(base) {
  return `${base}\n\n${rndPick(basicEncuadres)}, ${rndPick(basicLuz)}. ${rndPick(basicEstilo)}. Sin personas. Formato vertical 9:16.`;
}
function ensamblarIso(base) {
  return `${base}\n\n${rndPick(isoFondos)}. ${rndPick(isoElementos)}. Estilo Ligne Claire illustration isométrico, perspectiva diagonal 45°, bordes definidos, colores planos sin degradados complejos, sin fotografías reales. Formato vertical 9:16.`;
}

// ─ Toggle acordeón principal ─
function toggleImgAccordion(rawKey) {
  imgAccordionOpen[rawKey] = !imgAccordionOpen[rawKey];
  if (!imgAccordionOpen[rawKey]) imgCardOpen[rawKey] = null;
}

// ─ Toggle tarjeta (una sola activa por sección) ─
async function toggleImgCard(rawKey, styleId, seccionTexto, seccionLabel) {
  const alreadyOpen = imgCardOpen[rawKey] === styleId;
  imgCardOpen[rawKey] = alreadyOpen ? null : styleId;
  if (!alreadyOpen) {
    const k = `${rawKey}__${styleId}`;
    if (!imgPromptBase[k]) {
      await llamarGrokImg(rawKey, styleId, seccionTexto, seccionLabel);
    }
  }
}

// ─ Regenerar imagen ─
async function regenerarImg(rawKey, styleId, seccionTexto, seccionLabel) {
  await llamarGrokImg(rawKey, styleId, seccionTexto, seccionLabel);
}

// ─ Change Details (sin API) ─
function cambiarDetallesImg(rawKey, styleId) {
  const k = `${rawKey}__${styleId}`;
  const base = imgPromptBase[k];
  if (!base) return;
  if (styleId === "cine") imgPromptTexto[k] = ensamblarCine(base);
  else if (styleId === "info") imgPromptTexto[k] = ensamblarInfo(base);
  else if (styleId === "hand") imgPromptTexto[k] = ensamblarHand(base);
  else if (styleId === "iso") imgPromptTexto[k] = ensamblarIso(base);
  else imgPromptTexto[k] = ensamblarBasic(base);
}

// ─ Copiar prompt ─
async function copiarImgPrompt(rawKey, styleId) {
  const k = `${rawKey}__${styleId}`;
  const texto = imgPromptTexto[k];
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  imgCopiado[k] = true;
  setTimeout(() => {
    imgCopiado[k] = false;
  }, 2500);
}

// ─ Llamada a Grok vía grokProxy para prompts de imagen ─
async function llamarGrokImg(rawKey, styleId, seccionTexto, seccionLabel) {
  if (!props.videoContext) return;
  const k = `${rawKey}__${styleId}`;
  const v = props.videoContext;
  const gc = v.guion_completo || {};
  const strip = (t) => (t || "").replace(/\[.*?\]\s*/g, "").trim();

  const ctxGuion = `CONTEXTO DEL VIDEO:
- Tema: ${v.tema || "—"}
- Negocio/Sector: ${v.sector_contexto || "negocio familiar latinoamericano"}
- Hook [0-5s]: ${strip(gc.hook) || "—"}
- Caso/Validación [5-25s]: ${strip(gc.caso_validacion) || "—"}
- Desarrollo [25-50s]: ${strip(gc.desarrollo) || "—"}
- Micro Acción [50-58s]: ${strip(gc.micro_accion) || "—"}
- CTA [58-60s]: ${strip(gc.cta) || "—"}

SECCIÓN OBJETIVO: ${seccionLabel}
TEXTO EXACTO DE LA SECCIÓN: "${seccionTexto}"`;

  let systemMsg = "";
  let userMsg = "";

  if (styleId === "cine") {
    const mood = SECTION_MOOD[rawKey] || SECTION_MOOD.desarrollo;
    systemMsg =
      'Eres director de arte de fotografía documental latinoamericana para redes sociales. Describes escenas fotográficas precisas y visuales para generadores de imágenes IA. Responde Únicamente en JSON: {"prompt": "..."}. Idioma: español.';
    userMsg = `Genera una descripción de escena fotográfica hiperrealista para contenido de redes sociales vertical.

${ctxGuion}

REGLAS FIJAS:
- El personaje SIEMPRE es el dueño o dueña del negocio: latinoamericano/a, 25-40 años, emprendedor/a familiar. NUNCA empleados ni clientes.
- Está en su propio local con objetos y elementos específicos y concretos del rubro.
- La escena debe reflejar EXACTAMENTE el texto de la sección objetivo.
- NO menciones lentes, mm, ángulos de cámara, iluminación técnica ni encuadres. Solo la escena narrativa.
- Máximo 4 oraciones densas y visuales. Sin listas.

ESTADO EMOCIONAL Y ACCIÓN REQUERIDO: ${mood}

Describe: aspecto físico y ropa específica del personaje según su rubro, cómo es exactamente su local con objetos concretos, qué está haciendo en ese momento preciso relacionado con el texto de la sección, y qué transmiten su postura y rostro.`;
  } else if (styleId === "info") {
    systemMsg =
      'Eres un experto en narrativa visual y diseño de información para redes sociales. Describes composiciones infográficas secuenciales para generadores de imágenes IA. Responde Únicamente en JSON: {"prompt": "..."}. Idioma: español.';
    userMsg = `Genera la descripción de una infografía narrativa vertical (9:16) con flujo secuencial de arriba hacia abajo.

${ctxGuion}

REGLAS DE NARRATIVA Y DISEÑO:
- ESTRUCTURA: Divide la imagen en una secuencia vertical de 3 niveles claramente conectados por una línea punteada o flechas estilizadas que guíen el ojo hacia abajo. lEGIBLE A 3 SEGUNDOS.
- ICONOGRAFÍA: Los iconos deben ser estilo "Line-Art" de trazo grueso y uniforme, con bordes redondeados, modernos y minimalistas (estilo Apple o interfaz premium).
- CONTENIDO: Extrae exactamente 3 pasos o conceptos del TEXTO DE LA SECCIÓN y asígnales un icono y un título corto a cada uno.
- TIPOGRAFÍA Y LEGIBILIDAD: Títulos en negrita Sans-Serif (tipo Inter) y texto de apoyo muy breve. Todo el texto debe ser grande y contrastado.
- Sin personas reales. Estética 100% digital, limpia y profesional.

Describe: El flujo narrativo de arriba a abajo, el diseño específico de los 3 iconos de trazo grueso, cómo se conectan visualmente los conceptos y la disposición del texto en la composición vertical. Máximo 5 oraciones densas.`;
  } else if (styleId === "hand") {
    systemMsg =
      'Eres director de arte especializado en contenido orgánico y autenticidad visual para pequeños negocios latinoamericanos. Responde Únicamente en JSON: {"prompt": "..."}. Idioma: español.';
    userMsg = `Genera la descripción de una imagen estilo nota escrita a mano para redes sociales vertical.

${ctxGuion}

REGLAS:
- Extrae LA frase o idea más importante del TEXTO EXACTO DE LA SECCIÓN (máximo 12-15 palabras).
- Esa frase se escribe a mano sobre una superficie física real del entorno del negocio.
- Superficies válidas: papel kraft, cuaderno de campo, libreta artesanal, pizarra del negocio, post-it.
- El fondo debe verse auténtico: parte del negocio visible, no estudio fotográfico.
- Pueden haber elementos dibujados a mano alrededor: flechas, subrayados, pequeños bocetos.
- Sensación: nota real de un emprendedor latinoamericano, no diseñada artificialmente.
- Fotografía cenital o ángulo 3/4. Formato vertical 9:16.

Describe: la superficie exacta, la frase concreta escrita (extráela del texto de la sección), el instrumento de escritura, los elementos decorativos manuales, el entorno de fondo y la iluminación. Máximo 4 oraciones. Sin listas.`;
  } else if (styleId === "iso") {
    systemMsg =
      'Eres un ilustrador de narrativa visual y experto en estilo "Ligne Claire" (Línea Clara). Describes escenas isométricas 2D con un nivel de detalle orgánico y realista para generadores de imágenes. Responde Únicamente en JSON: {"prompt": "..."}. Idioma: español.';
    userMsg = `Genera una descripción para una ilustración isométrica 2D con alto nivel de detalle narrativo.

${ctxGuion}

REGLAS DE ESTILO (CRÍTICAS):


REGLAS DE ORO DE EXPRESIÓN Y ESTILO:
- ROSTRO DETALLADO: El personaje NO debe tener ojos de punto. Describe ojos expresivos con cejas arqueadas, párpados y pupilas visibles que miren hacia el objeto de interés. La boca debe reflejar una emoción humana real (tensión, grito de frustración o una sonrisa amplia de éxito) con labios definidos. Todo el rostro debe de reflejar el TEXTO DE LA SECCIÓN (frustración, búsqueda, éxito).
- PERSPECTIVA: Isométrica estricta (vista de pájaro en diagonal a 45 grados). Todos los objetos, estantes y el mostrador deben mantener ángulos paralelos sin puntos de fuga, creando un efecto de "maqueta" o "diorama".
- ESTILO VISUAL: Línea clara (Ligne Claire) con contornos negros finos y definidos. Nada de realismo fotográfico ni 3D renderizado; debe parecer un dibujo técnico/cómic profesional de alta calidad. Nivel de detalle extraordinario en texturas: herramientas con óxido, cajas de cartón con pliegues, manchas de suciedad en la ropa y serrín en el suelo.
- DETALLE ORGÁNICO:  Incluye texturas de suciedad, óxido en herramientas, manchas de grasa en el delantal y serrín en el suelo o según corresponda el contexto.
- ESCENARIO: El local debe estar "abarrotado". Estanterías repletas, objetos desordenados y elementos específicos del rubro que llenen el espacio.
- PERSONAJE: Emprendedor/a latinoamericano/a real con ropa de trabajo auténtica con desgaste visible (o no), expresión facial humana intensa. Representado en una pose que refleje el TEXTO DE LA SECCIÓN (frustración, búsqueda, éxito).
- COLORES: Fondo sólido (preferencia AMARILLO vibrante o AZUL claro), Los objetos internos deben tener colores saturados y sombreado plano (cel-shading).
- ELEMENTOS FLOTANTES: Solo si el texto lo requiere, incluye globos de diálogo estilo cómic o iconos de interfaz flotantes que se integren orgánicamente.
- Formato vertical 9:16.

Describe: El color de fondo sólido, la apariencia detallada del personaje y su ropa, la densidad y desorden del local (menciona al menos 6 objetos específicos), la acción física exacta y la atmósfera de "negocio real" que se respira. Máximo 5 oraciones densas.

REGLAS DE ESTILO:
- Perspectiva ISOMÉTRICA (vista desde arriba en diagonal).`;
  } else {
    // basic
    systemMsg =
      'Eres fotógrafo de producto especializado en imágenes simples y limpias para negocios latinoamericanos en redes sociales. Responde Únicamente en JSON: {"prompt": "..."}. Idioma: español.';
    userMsg = `Genera la descripción de una imagen fotográfica muy simple y limpia para acompañar este fragmento de guion en redes sociales verticales.

${ctxGuion}

REGLAS:
- SIN personas en la imagen.
- Fotografiar el objeto, producto, herramienta o elemento del negocio MAS directamente relacionado con el TEXTO EXACTO DE LA SECCIÓN.
- Fondo limpio y neutro: blanco, gris claro o superficie natural del negocio.
- Composición simple y centrada. Sin texto superpuesto. Una sola idea visual.
- Calidad fotográfica alta. Formato vertical 9:16.

Describe: qué objeto o elementos específicos aparecen y por qué se relacionan con el texto de la sección, el fondo y la superficie, la composición y orden visual, y la sensación que transmite. Máximo 3 oraciones directas. Sin listas. Sin personas.`;
  }

  try {
    imgGenerando[k] = true;
    const { httpsCallable } = await import("firebase/functions");
    const { functions } = await import("@/firebaseInit");
    const grokProxy = httpsCallable(functions, "grokProxy");
    const resp = await grokProxy({
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      response_format: { type: "json_object" },
      max_tokens: 450,
      temperature: 0.85,
    });
    const parsed = JSON.parse((resp.data.content || "{}").trim());
    const base = (parsed.prompt || "").trim();
    imgPromptBase[k] = base;
    if (styleId === "cine") imgPromptTexto[k] = ensamblarCine(base);
    else if (styleId === "info") imgPromptTexto[k] = ensamblarInfo(base);
    else if (styleId === "hand") imgPromptTexto[k] = ensamblarHand(base);
    else if (styleId === "iso") imgPromptTexto[k] = ensamblarIso(base);
    else imgPromptTexto[k] = ensamblarBasic(base);
  } catch (err) {
    console.error(`Error grokProxy img ${k}:`, err);
  } finally {
    imgGenerando[k] = false;
  }
}
</script>
