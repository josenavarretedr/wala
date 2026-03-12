<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Volver -->
      <button
        @click="$router.push('/guiones/dashboard')"
        class="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg
          class="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Dashboard
      </button>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
        ></div>
      </div>

      <!-- Contenido -->
      <div v-else-if="video">
        <!-- HEADER DEL VIDEO -->
        <div class="mb-8">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <!-- Voz -->
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                video.voz === 'A'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700',
              ]"
            >
              {{ video.voz === "A" ? "José Navarrete" : "WALA" }}
            </span>
            <!-- Ruta -->
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                rutaBadgeClass(video.ruta),
              ]"
            >
              {{ rutaLabel(video.ruta) }}
            </span>
            <!-- Tipo -->
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                tipoBadgeClass(video.tipo_contenido),
              ]"
            >
              {{ tipoLabel(video.tipo_contenido) }}
            </span>
            <!-- Narrativa -->
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                narrativaBadgeClass(video.narrativa),
              ]"
            >
              {{ narrativaLabel(video.narrativa) }}
            </span>
            <!-- Estado -->
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                estadoBadgeClass(video.estado),
              ]"
            >
              {{ video.estado }}
            </span>
            <!-- Formato visual -->
            <span
              v-if="video.formato_visual_recomendado"
              class="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700"
            >
              🎬 {{ video.formato_visual_recomendado }}
            </span>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 leading-tight">
            {{ video.tema }}
          </h1>
          <p v-if="video.sector_contexto" class="text-gray-500 text-sm mt-1">
            📍 {{ video.sector_contexto }}
          </p>
        </div>

        <!-- ══ GENERAR IMAGEN ══ -->
        <div
          class="mb-6 bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 rounded-2xl p-5"
        >
          <div class="flex items-center gap-2 mb-4">
            <div
              class="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm"
            >
              ✦
            </div>
            <h2 class="font-bold text-gray-900">Generar prompt de imagen</h2>
            <span class="ml-auto text-xs text-gray-400"
              >Formato vertical · Estilo documental 8K</span
            >
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Toma 1 -->
            <div>
              <button
                @click="togglePrompt('toma1')"
                class="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-violet-200 rounded-xl hover:border-violet-400 hover:shadow-sm transition-all text-left group"
              >
                <div>
                  <p
                    class="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-0.5"
                  >
                    Toma 1
                  </p>
                  <p class="text-sm font-medium text-gray-800">El problema</p>
                  <p class="text-xs text-gray-500">
                    Tensión · Expresión preocupada
                  </p>
                </div>
                <svg
                  :class="[
                    'w-4 h-4 text-violet-400 transition-transform shrink-0',
                    promptVisible.toma1 && 'rotate-180',
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

              <!-- Card expandible Toma 1 -->
              <div
                v-if="promptVisible.toma1"
                class="mt-2 bg-white border border-violet-100 rounded-xl p-4"
              >
                <!-- Spinner carga -->
                <div
                  v-if="generandoPrompt.toma1"
                  class="flex items-center gap-2 py-3"
                >
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"
                  ></div>
                  <span class="text-xs text-violet-600 font-medium"
                    >Generando con IA…</span
                  >
                </div>
                <!-- Texto generado -->
                <p
                  v-else
                  class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap"
                >
                  {{ promptTexto.toma1 }}
                </p>
                <!-- Botones -->
                <div
                  v-if="!generandoPrompt.toma1"
                  class="mt-3 flex flex-wrap gap-2"
                >
                  <button
                    @click="regenerarPrompt('toma1')"
                    class="flex-none px-3 py-2 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all"
                    title="Nueva llamada a Grok con el mismo contexto"
                  >
                    ↺ Regenerar
                  </button>
                  <button
                    @click="cambiarDetalles('toma1')"
                    :disabled="!promptBase.toma1"
                    class="flex-none px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-all"
                    title="Cambia plano, momento, ángulo y luz sin nueva llamada a la API"
                  >
                    ✦ Change Details
                  </button>
                  <button
                    @click="copiarPrompt('toma1')"
                    :class="[
                      'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                      copiado.toma1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-violet-600 text-white hover:bg-violet-700',
                    ]"
                  >
                    {{
                      copiado.toma1
                        ? "\u2713 Copiado al portapapeles"
                        : "Copiar prompt"
                    }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Toma 2 -->
            <div>
              <button
                @click="togglePrompt('toma2')"
                class="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-pink-200 rounded-xl hover:border-pink-400 hover:shadow-sm transition-all text-left group"
              >
                <div>
                  <p
                    class="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-0.5"
                  >
                    Toma 2
                  </p>
                  <p class="text-sm font-medium text-gray-800">El cambio</p>
                  <p class="text-xs text-gray-500">
                    Acción · Enfoque y determinación
                  </p>
                </div>
                <svg
                  :class="[
                    'w-4 h-4 text-pink-400 transition-transform shrink-0',
                    promptVisible.toma2 && 'rotate-180',
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

              <!-- Card expandible Toma 2 -->
              <div
                v-if="promptVisible.toma2"
                class="mt-2 bg-white border border-pink-100 rounded-xl p-4"
              >
                <!-- Spinner carga -->
                <div
                  v-if="generandoPrompt.toma2"
                  class="flex items-center gap-2 py-3"
                >
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"
                  ></div>
                  <span class="text-xs text-pink-600 font-medium"
                    >Generando con IA…</span
                  >
                </div>
                <!-- Texto generado -->
                <p
                  v-else
                  class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap"
                >
                  {{ promptTexto.toma2 }}
                </p>
                <!-- Botones -->
                <div
                  v-if="!generandoPrompt.toma2"
                  class="mt-3 flex flex-wrap gap-2"
                >
                  <button
                    @click="regenerarPrompt('toma2')"
                    class="flex-none px-3 py-2 rounded-lg text-xs font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 transition-all"
                    title="Nueva llamada a Grok con el mismo contexto"
                  >
                    ↺ Regenerar
                  </button>
                  <button
                    @click="cambiarDetalles('toma2')"
                    :disabled="!promptBase.toma2"
                    class="flex-none px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-all"
                    title="Cambia plano, momento, ángulo y luz sin nueva llamada a la API"
                  >
                    ✦ Change Details
                  </button>
                  <button
                    @click="copiarPrompt('toma2')"
                    :class="[
                      'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                      copiado.toma2
                        ? 'bg-green-100 text-green-700'
                        : 'bg-pink-600 text-white hover:bg-pink-700',
                    ]"
                  >
                    {{
                      copiado.toma2
                        ? "\u2713 Copiado al portapapeles"
                        : "Copiar prompt"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- ══ FIN GENERAR IMAGEN ══ -->

        <div class="space-y-4">
          <!-- 1. CONFIGURACIÓN -->
          <CollapsibleSection
            title="Configuración"
            :open="openSections.configuracion"
            @toggle="toggleSection('configuracion')"
          >
            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                  >Estado</label
                >
                <select
                  v-model="editableData.estado"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option>GRABANDO</option>
                  <option>EDITANDO</option>
                  <option>PUBLICADO</option>
                </select>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                  >Duración estimada</label
                >
                <input
                  v-model="editableData.duracion_estimada"
                  type="text"
                  placeholder="Ej: 45s o 1.5min"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div class="md:col-span-2">
                <label
                  class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                  >Comentarios</label
                >
                <textarea
                  v-model="editableData.comentarios"
                  rows="3"
                  placeholder="Agrega notas o pendientes..."
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                ></textarea>
              </div>
            </div>
            <div class="flex gap-3">
              <button
                @click="handleSave"
                :disabled="saving"
                class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm disabled:bg-gray-400 transition-all"
              >
                {{ saving ? "Guardando..." : "Guardar Cambios" }}
              </button>
              <button
                @click="handleDelete"
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-all"
              >
                Eliminar
              </button>
            </div>
          </CollapsibleSection>

          <!-- 2. GANCHO -->
          <CollapsibleSection
            title="Gancho"
            :open="openSections.gancho"
            @toggle="toggleSection('gancho')"
          >
            <div v-if="video.gancho" class="space-y-4">
              <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p class="text-lg font-bold text-purple-900 leading-snug">
                  "{{ video.gancho.texto }}"
                </p>
                <p class="text-xs text-purple-500 mt-1">
                  {{ video.gancho.palabras_count }} palabras
                </p>
              </div>
              <div
                v-if="video.gancho.componentes"
                class="grid md:grid-cols-3 gap-3 text-sm"
              >
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    ¿Qué verás?
                  </p>
                  <p class="text-gray-800">
                    {{ video.gancho.componentes.que_veras }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    ¿Para quién?
                  </p>
                  <p class="text-gray-800">
                    {{ video.gancho.componentes.para_quien }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    ¿Por qué ahora?
                  </p>
                  <p class="text-gray-800">
                    {{ video.gancho.componentes.por_que_ahora }}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <!-- 3. CASO INICIAL + ESCENA -->
          <CollapsibleSection
            title="Caso Inicial y Escena"
            :open="openSections.caso"
            @toggle="toggleSection('caso')"
          >
            <div class="space-y-4">
              <!-- Caso Inicial -->
              <div v-if="video.caso_inicial">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
                    >Caso Inicial</span
                  >
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-xs',
                      video.caso_inicial.presente
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500',
                    ]"
                  >
                    {{ video.caso_inicial.presente ? "Incluido" : "No aplica" }}
                  </span>
                </div>
                <p
                  v-if="video.caso_inicial.texto"
                  class="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 italic"
                >
                  "{{ video.caso_inicial.texto }}"
                </p>
              </div>

              <!-- Escena Sugerida -->
              <div v-if="video.escena_sugerida" class="space-y-3">
                <div class="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-1"
                    >
                      Acción física
                    </p>
                    <p class="text-gray-800">
                      {{ video.escena_sugerida.accion_fisica }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-1"
                    >
                      Momento
                    </p>
                    <p class="text-gray-800">
                      {{ video.escena_sugerida.momento }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-1"
                    >
                      Energía
                    </p>
                    <p class="text-gray-800">
                      {{ video.escena_sugerida.energia }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="
                    video.escena_sugerida.props?.length ||
                    video.escena_sugerida.transiciones?.length
                  "
                  class="grid md:grid-cols-2 gap-3"
                >
                  <div v-if="video.escena_sugerida.props?.length">
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-2"
                    >
                      Props
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="p in video.escena_sugerida.props"
                        :key="p"
                        class="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs"
                        >{{ p }}</span
                      >
                    </div>
                  </div>
                  <div v-if="video.escena_sugerida.transiciones?.length">
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-2"
                    >
                      Transiciones sugeridas
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="t in video.escena_sugerida.transiciones"
                        :key="t"
                        class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                        >{{ t }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <!-- 4. GUION COMPLETO (Línea de tiempo) -->
          <CollapsibleSection
            title="Guion Completo"
            :open="openSections.guion"
            @toggle="toggleSection('guion')"
          >
            <EditorGuion
              :guion-completo="video.guion_completo"
              :micro-hooks="video.micro_hooks"
              :video-context="video"
              @section-updated="onGuionSectionUpdated"
            />
          </CollapsibleSection>

          <!-- 5. CTA -->
          <CollapsibleSection
            title="CTA"
            :open="openSections.cta"
            @toggle="toggleSection('cta')"
          >
            <div v-if="video.cta" class="space-y-3">
              <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                <p class="text-sm font-semibold text-green-800 mb-1">
                  Formato: {{ video.cta.formato }}
                </p>
                <p class="text-base text-green-900">
                  "{{ video.cta.texto_completo }}"
                </p>
              </div>
              <div class="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Mención WALA
                  </p>
                  <p class="text-gray-800 capitalize">
                    {{ video.cta.mencion_wala }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Beneficio específico
                  </p>
                  <p class="text-gray-800">
                    {{ video.cta.beneficio_especifico }}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <!-- 6. STORYTELLING -->
          <CollapsibleSection
            title="Storytelling"
            :open="openSections.storytelling"
            @toggle="toggleSection('storytelling')"
          >
            <div v-if="video.storytelling" class="space-y-3 text-sm">
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-gray-500 uppercase"
                  >Tipo</span
                >
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium',
                    video.narrativa === 'directa'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700',
                  ]"
                >
                  {{ video.storytelling.tipo }}
                </span>
              </div>
              <div v-if="video.storytelling.conectores_usados?.length">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Conectores usados
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="c in video.storytelling.conectores_usados"
                    :key="c"
                    class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                    >{{ c }}</span
                  >
                </div>
              </div>
              <div v-if="video.storytelling.validacion">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Validación
                </p>
                <p class="text-gray-700 bg-green-50 rounded-lg px-3 py-2">
                  {{ video.storytelling.validacion }}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <!-- 7. CAPTION -->
          <CollapsibleSection
            title="Caption"
            :open="openSections.caption"
            @toggle="toggleSection('caption')"
          >
            <div
              class="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap"
            >
              {{ video.caption }}
            </div>
          </CollapsibleSection>

          <!-- 8. ADAPTACIÓN AL SECTOR -->
          <CollapsibleSection
            title="Adaptación al Sector"
            :open="openSections.adaptacion"
            @toggle="toggleSection('adaptacion')"
          >
            <div v-if="video.adaptacion_sector" class="space-y-3 text-sm">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Contexto usado
                </p>
                <p class="text-gray-800">
                  {{ video.adaptacion_sector.contexto_usado }}
                </p>
              </div>
              <div v-if="video.adaptacion_sector.productos_mencionados?.length">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Productos mencionados
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="p in video.adaptacion_sector.productos_mencionados"
                    :key="p"
                    class="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs"
                    >{{ p }}</span
                  >
                </div>
              </div>
              <div class="grid md:grid-cols-2 gap-3">
                <div v-if="video.adaptacion_sector.temporalidades">
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Temporalidades
                  </p>
                  <p class="text-gray-800">
                    {{ video.adaptacion_sector.temporalidades }}
                  </p>
                </div>
                <div v-if="video.adaptacion_sector.problematicas_unicas">
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Problemáticas únicas
                  </p>
                  <p class="text-gray-800">
                    {{ video.adaptacion_sector.problematicas_unicas }}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <!-- 9. NOTAS DE PRODUCCIÓN + MÉTRICAS -->
          <CollapsibleSection
            title="Notas de Producción"
            :open="openSections.produccion"
            @toggle="toggleSection('produccion')"
          >
            <div class="space-y-4">
              <div class="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Tono narrativa
                  </p>
                  <p class="text-gray-900">
                    {{ video.notas_produccion?.tono_narrativa }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Velocidad
                  </p>
                  <p class="text-gray-900">
                    {{ video.notas_produccion?.velocidad }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Props / Materiales
                  </p>
                  <p class="text-gray-900">
                    {{ video.notas_produccion?.props || "—" }}
                  </p>
                </div>
              </div>

              <!-- Tips de edición + coherencia -->
              <div
                v-if="video.notas_produccion?.notas_edicion?.length"
                class="pt-4 border-t border-gray-100"
              >
                <div class="flex items-center gap-2 mb-3">
                  <h4
                    class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    Tips de Edición
                  </h4>
                  <span
                    v-if="video.formato_coherente !== undefined"
                    :class="[
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      video.formato_coherente
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700',
                    ]"
                  >
                    {{
                      video.formato_coherente
                        ? "✓ Formato coherente"
                        : "⚠ Revisar formato"
                    }}
                  </span>
                </div>
                <ul class="space-y-2">
                  <li
                    v-for="(tip, i) in video.notas_produccion.notas_edicion"
                    :key="i"
                    class="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span class="text-purple-500 mt-0.5 shrink-0">→</span>
                    {{ tip }}
                  </li>
                </ul>
              </div>

              <div class="pt-4 border-t border-gray-100">
                <h4
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3"
                >
                  Métricas Esperadas
                </h4>
                <div class="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-1"
                    >
                      Objetivo ruta
                    </p>
                    <p class="text-gray-800">
                      {{ video.metricas_esperadas?.objetivo_ruta }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-1"
                    >
                      Retención esperada
                    </p>
                    <p class="text-gray-800 font-medium">
                      {{ video.metricas_esperadas?.retencion_esperada }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="text-xs font-semibold text-gray-500 uppercase mb-1"
                    >
                      Tipo de interacción
                    </p>
                    <p class="text-gray-800">
                      {{ video.metricas_esperadas?.tipo_interaccion }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGuionesStore } from "@/stores/guionesStore";
import { useToast } from "@/composables/useToast";

import EditorGuion from "@/components/guiones/EditorGuion.vue";
import CollapsibleSection from "@/components/guiones/CollapsibleSection.vue";

const route = useRoute();
const router = useRouter();
const guionesStore = useGuionesStore();
const toast = useToast();

const videoId = route.params.videoId;
const video = ref(null);
const loading = ref(true);
const saving = ref(false);

const openSections = reactive({
  configuracion: true,
  gancho: true,
  caso: false,
  guion: false,
  cta: false,
  storytelling: false,
  caption: false,
  adaptacion: false,
  produccion: false,
});

const toggleSection = (s) => {
  openSections[s] = !openSections[s];
};

const editableData = reactive({
  estado: "",
  duracion_estimada: "",
  comentarios: "",
});

// ── Badge helpers ──
const rutaLabel = (v) =>
  ({ tecnica: "Técnica", viral: "Viral", amplia: "Amplia" })[v] || v || "—";
const tipoLabel = (v) =>
  ({ educativo: "Educativo", practico: "Práctico" })[v] || v || "—";
const narrativaLabel = (v) =>
  ({ directa: "Directa", estructurada: "Estructurada" })[v] || v || "—";

const rutaBadgeClass = (v) =>
  ({
    tecnica: "bg-indigo-100 text-indigo-700",
    viral: "bg-pink-100 text-pink-700",
    amplia: "bg-amber-100 text-amber-700",
  })[v] || "bg-gray-100 text-gray-600";

const tipoBadgeClass = (v) =>
  ({
    educativo: "bg-purple-100 text-purple-700",
    practico: "bg-teal-100 text-teal-700",
  })[v] || "bg-gray-100 text-gray-600";

const narrativaBadgeClass = (v) =>
  ({
    directa: "bg-green-100 text-green-700",
    estructurada: "bg-blue-100 text-blue-700",
  })[v] || "bg-gray-100 text-gray-600";

const estadoBadgeClass = (v) =>
  ({
    GRABANDO: "bg-blue-100 text-blue-700",
    EDITANDO: "bg-yellow-100 text-yellow-700",
    PUBLICADO: "bg-green-100 text-green-700",
  })[v] || "bg-gray-100 text-gray-700";

// ── Generador de prompts de imagen (Grok API) ──

const promptVisible = reactive({ toma1: false, toma2: false });
const promptTexto = reactive({ toma1: "", toma2: "" });
const promptBase = reactive({ toma1: "", toma2: "" }); // texto puro devuelto por Grok
const copiado = reactive({ toma1: false, toma2: false });
const generandoPrompt = reactive({ toma1: false, toma2: false });

// ─ Pools de variación — frontend elige aleatoriamente y ensambla ─
const planos = [
  "Plano medio, altura de cintura, lente 35mm",
  "Plano americano, altura de rodillas, lente 50mm",
  "Primer plano enfocado en rostro y manos, lente 85mm",
  "Plano medio corto, tres cuartos de perfil, lente 50mm",
  "Plano detalle alternado: manos en acción y rostro, lente 85mm",
];
const momentos = [
  "a primera hora de la mañana, antes de abrir el negocio",
  "a media mañana, en plena jornada de trabajo",
  "a última hora de la tarde, cerrando el día",
  "al mediodía, revisando resultados del día",
  "temprano en la mañana, preparando el negocio para el día",
];
const angulosCamara = [
  "Cámara ligeramente por debajo del nivel de los ojos, ángulo levemente contrapicado que da autoridad",
  "Cámara a nivel de los ojos, ángulo neutro documental directo",
  "Cámara levemente por encima, ángulo picado suave que muestra el entorno y los productos",
];
const detallesLuz1 = [
  "Sombras suaves que acentúan la tensión en el rostro.",
  "La luz cae de costado creando contraste que refuerza la expresión seria.",
  "Iluminación ligeramente subexpuesta en el fondo, el personaje en primer foco.",
];
const detallesLuz2 = [
  "Luz que destaca las manos en movimiento, fondo ligeramente desenfocado.",
  "Iluminación equilibrada que transmite claridad y momentum positivo.",
  "Destello suave de luz natural que entra por la ventana, símbolo visual de apertura.",
];

const r = (arr) => arr[Math.floor(Math.random() * arr.length)];

const PARRAFO_CIERRE =
  "Colores vivos y realistas, sin corrección de color artificial. " +
  "Profundidad de campo cinematográfica. " +
  "Estilo documental fotográfico profesional, textura de piel detallada, calidad 8K, sin filtros artificiales. " +
  "Atmósfera auténtica de negocio familiar latinoamericano. " +
  "Formato vertical 9:16.";

function ensamblarPrompt(toma, base) {
  const angulo = r(angulosCamara);
  const plano = r(planos);
  const momento = r(momentos);
  const luz = toma === "toma1" ? r(detallesLuz1) : r(detallesLuz2);
  return `${base}\n\n${angulo}. ${plano}. La escena ocurre ${momento}. ${luz}\n\n${PARRAFO_CIERRE}`;
}

async function llamarGrok(toma) {
  if (!video.value) return;
  const v = video.value;
  const limpiar = (t) => (t || "").replace(/\[.*?\]\s*/g, "").trim();

  const textoCaso = limpiar(v.caso_inicial?.texto);
  const textoAccion = limpiar(
    v.guion_completo?.micro_accion || v.guion_completo?.desarrollo,
  );

  const situacion =
    toma === "toma1"
      ? textoCaso || `El dueño enfrenta un problema relacionado con ${v.tema}`
      : textoAccion || `El dueño toma acción concreta para mejorar ${v.tema}`;

  const tipoToma =
    toma === "toma1"
      ? "TOMA 1 — EL PROBLEMA: el dueño/a enfrenta una dificultad real. Expresión de preocupación y tensión auténtica, postura tensa, mirada fija en el problema."
      : "TOMA 2 — EL CAMBIO: el dueño/a toma acción concreta. Expresión de concentración y determinación genuina, postura activa, energía visible de movimiento.";

  const userMsg = `Genera una descripción de escena fotográfica hiperrealista para contenido de redes sociales.

REGLAS FIJAS:
- El personaje SIEMPRE es el dueño o dueña del negocio: latinoamericano/a, 25-40 años, emprendedor/a familiar. NUNCA empleados, NUNCA clientes.
- Está en su propio local comercial con los elementos específicos del rubro.
- La escena debe estar directamente relacionada con la situación descrita.
- NO menciones lentes, mm, ángulos de cámara, iluminación técnica ni encuadres. Solo la escena narrativa.
- Máximo 4 oraciones densas y visuales. Sin listas ni viñetas.

DATOS DEL VIDEO:
- Tema: ${v.tema || "estrategias de negocio"}
- Negocio: ${v.sector_contexto || "negocio familiar latinoamericano"}
- Situación: ${situacion}

TIPO DE TOMA: ${tipoToma}

Describe: quién es la persona (aspecto físico, ropa específica de su rubro), cómo es exactamente su local y entorno de ese rubro con objetos concretos, qué está haciendo en ese momento preciso, y qué transmiten su postura y rostro.`;

  try {
    generandoPrompt[toma] = true;
    const { httpsCallable } = await import("firebase/functions");
    const { functions } = await import("@/firebaseInit");
    const grokProxy = httpsCallable(functions, "grokProxy");
    const resp = await grokProxy({
      messages: [
        {
          role: "system",
          content:
            "Eres un director de arte especializado en fotografía documental latinoamericana para redes sociales. " +
            "Describes escenas fotográficas precisas, visuales y auténticas para generadores de imágenes IA. " +
            "Idioma: español.",
        },
        { role: "user", content: userMsg },
      ],
      max_tokens: 400,
      temperature: 0.85,
    });
    const base = (resp.data.content || "").trim();
    promptBase[toma] = base;
    promptTexto[toma] = ensamblarPrompt(toma, base);
  } catch (err) {
    console.error("Error Grok imagen:", err);
    toast.error(
      "Error al generar prompt: " + (err.message || "intenta de nuevo"),
    );
  } finally {
    generandoPrompt[toma] = false;
  }
}

const togglePrompt = async (toma) => {
  const abriendo = !promptVisible[toma];
  promptVisible[toma] = abriendo;
  // Solo llama a Grok si aún no hay contenido base generado
  if (abriendo && !promptBase[toma]) {
    await llamarGrok(toma);
  }
};

const regenerarPrompt = async (toma) => {
  await llamarGrok(toma);
};

const cambiarDetalles = (toma) => {
  if (!promptBase[toma]) return;
  promptTexto[toma] = ensamblarPrompt(toma, promptBase[toma]);
};

const copiarPrompt = async (toma) => {
  const texto = promptTexto[toma];
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
    copiado[toma] = true;
    setTimeout(() => {
      copiado[toma] = false;
    }, 2500);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    copiado[toma] = true;
    setTimeout(() => {
      copiado[toma] = false;
    }, 2500);
  }
};

// ── Actualizar sección del guion desde EditorGuion ──
const onGuionSectionUpdated = ({ key, text }) => {
  if (!video.value?.guion_completo) return;
  video.value.guion_completo[key] = text;
};

// ── Guardar cambios ──
const handleSave = async () => {
  try {
    saving.value = true;
    const updates = {
      estado: editableData.estado,
      duracion_estimada: editableData.duracion_estimada,
      comentarios: editableData.comentarios,
      // Incluir guion_completo si fue editado localmente
      ...(video.value?.guion_completo
        ? { guion_completo: video.value.guion_completo }
        : {}),
    };
    await guionesStore.updateVideoInStore(videoId, updates);
    Object.assign(video.value, updates);
    toast.success("Cambios guardados");
  } catch (e) {
    toast.error("Error al guardar: " + e.message);
  } finally {
    saving.value = false;
  }
};

// ── Eliminar ──
const handleDelete = async () => {
  if (!confirm("¿Eliminar este video? Esta acción no se puede deshacer."))
    return;
  try {
    await guionesStore.deleteVideoFromStore(videoId);
    toast.success("Video eliminado");
    router.push("/guiones/dashboard");
  } catch (e) {
    toast.error("Error al eliminar: " + e.message);
  }
};

// ── Cargar ──
onMounted(async () => {
  try {
    loading.value = true;
    video.value = await guionesStore.loadVideo(videoId);
    editableData.estado = video.value.estado || "GRABANDO";
    editableData.duracion_estimada = video.value.duracion_estimada || "";
    editableData.comentarios = video.value.comentarios || "";
  } catch (e) {
    toast.error("Error al cargar video: " + e.message);
    router.push("/guiones/dashboard");
  } finally {
    loading.value = false;
  }
});
</script>
