<template>
  <div class="min-h-screen bg-gray-50/30 py-6 px-4 sm:px-6 lg:px-8">
    <div
      class="max-w-4xl mx-auto bg-white shadow-2xl shadow-gray-200/60 rounded-[32px] border border-gray-100/80 overflow-hidden transition-all duration-300"
    >
      <!-- Loading State -->
      <div
        v-if="store.loading"
        class="p-12 flex flex-col items-center justify-center min-h-[400px]"
      >
        <svg
          class="animate-spin h-10 w-10 text-[#E35336]"
          xmlns="http://www.w3.org/2000/svg"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span
          class="text-sm font-bold text-gray-500 mt-4 uppercase tracking-wider"
          >Cargando rúbricas de madurez...</span
        >
      </div>

      <!-- Flow 0: Moment Selector -->
      <div
        v-else-if="store.activeMoment === null"
        class="p-6 sm:p-10 space-y-8 font-display"
      >
        <!-- Header -->
        <div
          class="flex items-start justify-between gap-4 border-b border-gray-100 pb-6"
        >
          <div class="space-y-1">
            <h2
              class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-display"
            >
              Matriz de Desempeño WALA
            </h2>
            <p class="text-sm text-gray-500 font-medium">
              Selecciona el momento de la evaluación para continuar.
            </p>
          </div>
          <button
            @click="handleClose"
            class="p-2 sm:p-3 text-gray-400 hover:text-red-500 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/50 transition-all duration-200 cursor-pointer"
            title="Cerrar Diagnóstico"
          >
            <Xmark class="w-6 h-6" />
          </button>
        </div>

        <!-- Moments Selection Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div
            v-for="moment in moments"
            :key="moment.id"
            @click="!isMomentLocked(moment.id) && selectMoment(moment.id)"
            :class="[
              'group relative bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[200px]',
              isMomentLocked(moment.id)
                ? 'opacity-60 bg-gray-50 border-gray-200 cursor-not-allowed'
                : [
                    'border-gray-150/80 hover:shadow-xl -translate-y-0 hover:-translate-y-1 cursor-pointer',
                    moment.hoverBorderColorClass,
                    moment.hoverBgColorClass
                  ]
            ]"
          >
            <!-- Top Row: Icon and Status Badge -->
            <div class="flex justify-between items-start gap-4">
              <div
                :class="[
                  'p-3.5 rounded-2xl shadow-inner transition-transform duration-300 flex-shrink-0',
                  isMomentLocked(moment.id)
                    ? 'bg-gray-100 text-gray-400'
                    : [moment.bgColorClass, moment.colorClass, 'group-hover:scale-110']
                ]"
              >
                <component :is="isMomentLocked(moment.id) ? Lock : moment.icon" class="w-6 h-6" />
              </div>

              <!-- Status Badge -->
              <div class="flex flex-col items-end gap-1.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset tracking-wide border',
                    isMomentLocked(moment.id)
                      ? 'bg-gray-150/50 text-gray-400 ring-gray-400/10 border-gray-200'
                      : [moment.bgColorClass, moment.colorClass, moment.ringColorClass, moment.borderColorClass]
                  ]"
                >
                  {{ moment.phase }}
                </span>

                <!-- Dynamic Progress Badge -->
                <span
                  v-if="!isMomentLocked(moment.id)"
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider',
                    getMomentProgress(moment.id) === totalIndicatorsCount
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-700/10'
                      : getMomentProgress(moment.id) > 0
                      ? 'bg-amber-50 text-amber-700 border-amber-200/60 ring-1 ring-amber-700/10'
                      : 'bg-gray-50 text-gray-500 border-gray-200 ring-1 ring-gray-400/10'
                  ]"
                >
                  {{ getMomentProgress(moment.id) === totalIndicatorsCount ? 'Completado' : getMomentProgress(moment.id) > 0 ? 'En Progreso' : 'Pendiente' }}
                </span>

                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-gray-100 text-gray-400 border-gray-200 uppercase tracking-wider"
                >
                  Bloqueado
                </span>
              </div>
            </div>

            <!-- Middle Row: Text description -->
            <div class="mt-4 space-y-1">
              <h3
                :class="[
                  'text-base sm:text-lg font-bold text-gray-900 transition-colors font-display',
                  !isMomentLocked(moment.id) && moment.hoverTextColorClass
                ]"
              >
                {{ moment.title }}
              </h3>
              <p class="text-xs text-gray-500 font-medium leading-relaxed">
                {{ moment.description }}
              </p>
            </div>

            <!-- Bottom Row: Progress level display -->
            <div class="mt-4 pt-3 border-t border-gray-100/60 space-y-2">
              <div class="flex justify-between items-center text-xs font-semibold">
                <span class="text-gray-400">Progreso</span>
                <span
                  :class="[
                    isMomentLocked(moment.id)
                      ? 'text-gray-400'
                      : getMomentProgress(moment.id) === totalIndicatorsCount
                      ? 'text-emerald-600'
                      : getMomentProgress(moment.id) > 0
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  ]"
                >
                  {{ isMomentLocked(moment.id) ? 0 : getMomentProgress(moment.id) }} / {{ totalIndicatorsCount }}
                </span>
              </div>
              <!-- Progress Bar -->
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    isMomentLocked(moment.id)
                      ? 'bg-gray-200'
                      : getMomentProgress(moment.id) === totalIndicatorsCount
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  ]"
                  :style="{ width: `${isMomentLocked(moment.id) ? 0 : (getMomentProgress(moment.id) / totalIndicatorsCount) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end pt-6 border-t border-gray-100 mt-4">
          <button
            @click="handleClose"
            class="inline-flex items-center gap-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3.5 text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer"
          >
            Cerrar Diagnóstico
          </button>
        </div>
      </div>

      <!-- Flow 1: Area Selector -->
      <div
        v-else-if="store.activeArea === null"
        class="p-6 sm:p-10 space-y-8 font-display"
      >
        <!-- Header -->
        <div
          class="flex items-start justify-between gap-4 border-b border-gray-100 pb-6"
        >
          <div class="flex items-center gap-4">
            <button
              @click="store.activeMoment = null"
              class="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl border border-gray-150 transition-all cursor-pointer"
              title="Cambiar Momento"
            >
              <NavArrowLeft class="w-5 h-5" />
            </button>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide bg-[#E35336]/10 text-[#E35336] border border-[#E35336]/20"
                >
                  {{ getMomentLabel(store.activeMoment) }}
                </span>
              </div>
              <h2
                class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-display mt-1"
              >
                Matriz de Desempeño WALA
              </h2>
            </div>
          </div>
          <button
            @click="handleClose"
            class="p-2 sm:p-3 text-gray-400 hover:text-red-500 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/50 transition-all duration-200 cursor-pointer"
            title="Cerrar Diagnóstico"
          >
            <Xmark class="w-6 h-6" />
          </button>
        </div>

        <!-- Areas Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div
            v-for="area in AREAS_CONFIG"
            :key="area.id"
            @click="selectArea(area.id)"
            class="group relative bg-white border border-gray-150/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-xl hover:border-[#E35336]/40 hover:bg-[#E35336]/5 -translate-y-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-row sm:flex-col items-center sm:items-stretch justify-start sm:justify-between min-h-[72px] sm:min-h-[170px] gap-4"
          >
            <!-- Badge de progreso/completado (Icon only on mobile, Icon + Progress Row on desktop) -->
            <div class="flex sm:flex-row sm:justify-between sm:items-start gap-4 flex-shrink-0">
              <div
                :class="[
                  'p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 flex-shrink-0',
                  getAreaColorClasses(area.id),
                ]"
              >
                <component :is="getAreaIcon(area.icon)" class="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <!-- Progreso Desktop (Hidden on mobile, integrated into content info instead) -->
              <span
                :class="[
                  'hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset tracking-wide',
                  store.areaProgress[area.id] === 3
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-700/10 border border-emerald-100'
                    : store.areaProgress[area.id] > 0
                      ? 'bg-amber-50 text-amber-700 ring-amber-700/10 border border-amber-100'
                      : 'bg-gray-50 text-gray-500 ring-gray-600/10 border border-gray-150',
                ]"
              >
                <span class="relative flex h-1.5 w-1.5 shrink-0">
                  <span
                    v-if="
                      store.areaProgress[area.id] > 0 &&
                      store.areaProgress[area.id] < 3
                    "
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                  ></span>
                  <span
                    :class="[
                      'relative inline-flex rounded-full h-1.5 w-1.5',
                      store.areaProgress[area.id] === 3
                        ? 'bg-emerald-500'
                        : store.areaProgress[area.id] > 0
                          ? 'bg-amber-500'
                          : 'bg-gray-300',
                    ]"
                  ></span>
                </span>
                {{ store.areaProgress[area.id] }} / 3 Completados
              </span>
            </div>

            <!-- Content info -->
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <h3
                class="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#E35336] transition-colors font-display truncate"
              >
                {{ area.id }}. {{ area.name }}
              </h3>
              
              <div class="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
                <!-- Score Average -->
                <span
                  v-if="store.areaAverage[area.id] !== null"
                  class="inline-flex items-center gap-1 bg-[#E35336]/10 text-[#E35336] px-1.5 py-0.5 sm:px-2 rounded-md border border-[#E35336]/20 text-[10px] sm:text-xs font-semibold"
                >
                  ★ Score: {{ store.areaAverage[area.id] }}
                </span>

                <!-- Progreso Mobile (Compact pill) -->
                <span
                  :class="[
                    'sm:hidden inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset tracking-wide',
                    store.areaProgress[area.id] === 3
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-700/10 border border-emerald-100'
                      : store.areaProgress[area.id] > 0
                        ? 'bg-amber-50 text-amber-700 ring-amber-700/10 border border-amber-100'
                        : 'bg-gray-50 text-gray-500 ring-gray-600/10 border border-gray-150',
                  ]"
                >
                  <span class="relative flex h-1 w-1 shrink-0">
                    <span
                      v-if="
                        store.areaProgress[area.id] > 0 &&
                        store.areaProgress[area.id] < 3
                      "
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                    ></span>
                    <span
                      :class="[
                        'relative inline-flex rounded-full h-1 w-1',
                        store.areaProgress[area.id] === 3
                          ? 'bg-emerald-500'
                          : store.areaProgress[area.id] > 0
                            ? 'bg-amber-500'
                            : 'bg-gray-300',
                      ]"
                    ></span>
                  </span>
                  <span>{{ store.areaProgress[area.id] }}/3</span>
                </span>
                
                <span class="hidden sm:inline text-xs font-semibold text-gray-400 ml-1">3 Indicadores clave</span>
              </div>
            </div>

            <!-- Mobile Action Arrow -->
            <div class="sm:hidden text-gray-400 group-hover:text-[#E35336] transition-colors flex-shrink-0">
              <NavArrowRight class="w-5 h-5" />
            </div>

            <!-- Desktop Action details on hover -->
            <div
              class="hidden sm:block absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
            >
              <div
                class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl shadow-sm border border-[#E35336]/20"
              >
                <NavArrowRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end pt-6 border-t border-gray-100 mt-4">
          <button
            @click="handleClose"
            class="inline-flex items-center gap-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3.5 text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer"
          >
            Cerrar Diagnóstico
          </button>
        </div>
      </div>

      <!-- Flow 2: Indicator Steps loop -->
      <div v-else class="flex flex-col min-h-[500px]">
        <!-- Header -->
        <div
          class="p-6 border-b border-gray-100 flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-4">
            <button
              @click="goBackToAreas"
              class="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl border border-gray-150 transition-all cursor-pointer"
              title="Volver a Selección de Áreas"
            >
              <NavArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <span
                class="text-xs font-bold text-[#E35336] uppercase tracking-widest block font-display"
              >
                Área {{ store.activeArea }}: {{ store.currentArea?.name }}
              </span>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                Evaluando Desempeño
              </h3>
            </div>
          </div>

          <!-- Stepper progress dots -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400 font-bold tracking-wide mr-1">
              Indicador {{ store.activeIndicatorIndex + 1 }} / 3
            </span>
            <div class="flex items-center gap-1.5">
              <div
                v-for="index in 3"
                :key="index"
                :class="[
                  'w-2.5 h-2.5 rounded-full transition-all duration-300',
                  index - 1 === store.activeIndicatorIndex
                    ? 'bg-[#E35336] scale-125 shadow-sm shadow-[#E35336]/20'
                    : index - 1 < store.activeIndicatorIndex
                      ? 'bg-[#E35336]/30'
                      : 'bg-gray-200',
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Main Form Step -->
        <div class="p-6 sm:p-10 space-y-8 flex-1 pb-32">
          <!-- Indicator Identification & Evaluation scope -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E35336]/15 text-[#E35336] font-extrabold text-xs"
              >
                {{ store.currentIndicator?.key }}
              </span>
              <h1
                class="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-display"
              >
                {{ store.currentIndicator?.title }}
              </h1>
            </div>

            <div
              class="bg-[#E35336]/5 border border-[#E35336]/15 rounded-3xl p-4 sm:p-5 flex gap-4 shadow-sm items-start"
            >
              <div
                class="p-2.5 bg-[#E35336]/10 text-[#E35336] rounded-2xl flex-shrink-0"
              >
                <GraphUp class="w-5 h-5" />
              </div>
              <div class="space-y-1">
                <span
                  class="text-xs font-bold text-[#E35336] uppercase tracking-widest"
                  >¿Qué evalúa?</span
                >
                <p class="text-sm sm:text-base text-gray-700 font-medium">
                  {{ store.currentIndicator?.evaluates }}
                </p>
              </div>
            </div>
          </div>

          <!-- Selectable Levels Cards Grid -->
          <div class="space-y-4">
            <h3
              class="text-sm font-bold text-gray-400 uppercase tracking-wider"
            >
              Criterio Observable
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <button
                v-for="level in store.currentIndicator?.levels"
                :key="level.value"
                @click="selectLevel(level.value)"
                :class="[
                  'group relative w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-300 text-left border flex flex-row sm:flex-col items-center sm:items-stretch justify-start sm:justify-between min-h-[72px] sm:min-h-[140px] gap-4 sm:gap-0 hover:-translate-y-0.5 active:scale-[0.98]',
                  store.diagnosticScores[store.currentIndicator.key] ===
                  level.value
                    ? 'bg-white border-2 border-[#E35336] text-gray-900 shadow-lg shadow-[#E35336]/10'
                    : 'bg-white text-gray-700 hover:bg-[#E35336]/5 hover:border-[#E35336]/30 border-gray-200 shadow-sm hover:shadow-md',
                ]"
              >
                <!-- Card Header (Level Circle and Selected Checkmark) -->
                <div class="flex items-center justify-between sm:w-full shrink-0">
                  <span
                    :class="[
                      'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-colors duration-200 shrink-0',
                      store.diagnosticScores[store.currentIndicator.key] ===
                      level.value
                        ? 'bg-[#E35336] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-[#E35336]/10 group-hover:text-[#E35336]',
                    ]"
                  >
                    {{ level.value }}
                  </span>

                  <!-- Check badge for Desktop -->
                  <div
                    v-if="
                      store.diagnosticScores[store.currentIndicator.key] ===
                      level.value
                    "
                    class="hidden sm:block p-1 bg-[#E35336] rounded-full text-white"
                  >
                    <Check class="w-4 h-4" />
                  </div>
                </div>

                <!-- Observable text details -->
                <p
                  :class="[
                    'text-xs sm:text-sm sm:mt-4 leading-normal sm:leading-relaxed flex-1 font-medium',
                    store.diagnosticScores[store.currentIndicator.key] ===
                    level.value
                      ? 'text-gray-900'
                      : 'text-gray-700',
                  ]"
                >
                  {{ level.text }}
                </p>

                <!-- Check badge for Mobile -->
                <div
                  v-if="
                    store.diagnosticScores[store.currentIndicator.key] ===
                    level.value
                  "
                  class="sm:hidden p-1 bg-[#E35336] rounded-full text-white shrink-0"
                >
                  <Check class="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          <!-- Advisor supportive cues & conversational questions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            <!-- Conversational Questions box -->
            <div
              class="bg-blue-50/30 border border-blue-100/70 rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col"
              :class="isQuestionsExpanded ? 'space-y-4' : 'space-y-0 pb-5'"
            >
              <div
                class="flex items-center justify-between cursor-pointer select-none group/btn"
                @click="isQuestionsExpanded = !isQuestionsExpanded"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h4
                    class="text-sm font-extrabold text-blue-900 uppercase tracking-wider"
                  >
                    Preguntas Conversacionales
                  </h4>
                </div>
                <div class="text-blue-500 hover:bg-blue-100/50 p-1.5 rounded-lg transition-colors duration-200">
                  <NavArrowDown
                    :class="[
                      'w-5 h-5 transition-transform duration-300',
                      isQuestionsExpanded ? 'rotate-180' : 'rotate-0',
                    ]"
                  />
                </div>
              </div>
              <ul v-show="isQuestionsExpanded" class="space-y-2.5">
                <li
                  v-for="(question, qIdx) in store.currentIndicator?.questions"
                  :key="qIdx"
                  class="flex items-start gap-2.5 text-xs sm:text-sm text-blue-800/80 font-medium"
                >
                  <span class="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{{ question }}</span>
                </li>
              </ul>
            </div>

            <!-- Advisor signals cues box -->
            <div
              class="bg-amber-50/30 border border-amber-100/70 rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col"
              :class="isSignalsExpanded ? 'space-y-4' : 'space-y-0 pb-5'"
            >
              <div
                class="flex items-center justify-between cursor-pointer select-none group/btn"
                @click="isSignalsExpanded = !isSignalsExpanded"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h4
                    class="text-sm font-extrabold text-amber-900 uppercase tracking-wider"
                  >
                    Señales para el Asesor
                  </h4>
                </div>
                <div class="text-amber-500 hover:bg-amber-100/50 p-1.5 rounded-lg transition-colors duration-200">
                  <NavArrowDown
                    :class="[
                      'w-5 h-5 transition-transform duration-300',
                      isSignalsExpanded ? 'rotate-180' : 'rotate-0',
                    ]"
                  />
                </div>
              </div>
              <ul v-show="isSignalsExpanded" class="space-y-2.5">
                <li
                  v-for="(signal, sIdx) in store.currentIndicator?.signals"
                  :key="sIdx"
                  class="flex items-start gap-2.5 text-xs sm:text-sm text-amber-800/80 font-medium"
                >
                  <span class="text-amber-500 font-bold shrink-0 mt-0.5"
                    >•</span
                  >
                  <span>{{ signal }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="space-y-3 pt-2">
            <label
              class="flex items-center gap-2 text-sm font-extrabold text-gray-700 uppercase tracking-wider"
            >
              <Notes class="w-5 h-5 text-gray-500 shrink-0" /> Comentarios y Evidencias de Respaldo
            </label>
            <textarea
              v-model="store.diagnosticComments[store.currentIndicator.key]"
              rows="3"
              class="w-full rounded-2xl border border-gray-200 shadow-sm focus:border-[#E35336] focus:ring-[#E35336] text-sm p-4 font-medium text-gray-700 bg-gray-50/30"
              placeholder="Registra aquí anotaciones clave, evidencias encontradas, justificación del puntaje asignado o compromisos acordados con el asesorado..."
            ></textarea>
          </div>
        </div>

        <!-- Sticky Bottom Navigation Bar -->
        <div
          class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-150 shadow-2xl flex items-center justify-between max-w-4xl mx-auto rounded-t-[24px]"
        >
          <button
            @click="goPrevious"
            class="inline-flex items-center gap-1.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <NavArrowLeft class="w-4 h-4" />
            Anterior
          </button>

          <!-- Warning helper if no score selected -->
          <div
            v-if="
              store.diagnosticScores[store.currentIndicator?.key] ===
                undefined ||
              store.diagnosticScores[store.currentIndicator?.key] === null
            "
            class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200"
          >
            ⚠️ Requiere seleccionar un nivel
          </div>

          <button
            @click="goNext"
            :disabled="store.saving"
            :class="[
              'inline-flex items-center gap-1.5 rounded-2xl text-white px-6 py-3.5 text-sm font-extrabold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50',
              store.diagnosticScores[store.currentIndicator?.key] ===
                undefined ||
              store.diagnosticScores[store.currentIndicator?.key] === null
                ? 'bg-[#E35336]/60 hover:bg-[#E35336]/75'
                : 'bg-[#E35336] hover:bg-[#E35336]/90',
            ]"
          >
            {{
              store.saving
                ? "Guardando..."
                : store.activeIndicatorIndex === 2
                  ? "Guardar y Regresar"
                  : "Siguiente"
            }}
            <NavArrowRight
              v-if="!store.saving && store.activeIndicatorIndex < 2"
              class="w-4 h-4"
            />
            <Check v-else-if="!store.saving" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import {
  Home,
  Megaphone,
  Cart,
  Archive,
  Coins,
  Book,
  Calendar,
  Xmark,
  NavArrowLeft,
  NavArrowRight,
  NavArrowDown,
  Check,
  GraphUp,
  SoilAlt,
  Notes,
  Lock,
} from "@iconoir/vue";
import { usePerformanceStore, AREAS_CONFIG } from "@/stores/performanceStore";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  businessId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const store = usePerformanceStore();
const toast = useToast();

const isQuestionsExpanded = ref(true);
const isSignalsExpanded = ref(true);

// Moments definition and configuration for grid selector
const moments = [
  {
    id: "inicial",
    phase: "Fase 1",
    title: "Diagnóstico Inicial",
    description: "Evaluación de madurez al comenzar el programa.",
    icon: SoilAlt,
    colorClass: "text-[#E35336]",
    bgColorClass: "bg-[#E35336]/10",
    ringColorClass: "ring-[#E35336]/10",
    borderColorClass: "border-[#E35336]/20",
    hoverBorderColorClass: "hover:border-[#E35336]/40",
    hoverBgColorClass: "hover:bg-[#E35336]/5",
    hoverTextColorClass: "group-hover:text-[#E35336]",
  },
  {
    id: "ciclo1",
    phase: "Fase 2",
    title: "Ciclo 1",
    description: "Primer ciclo de seguimiento y plan de acción.",
    icon: Calendar,
    colorClass: "text-blue-600",
    bgColorClass: "bg-blue-50",
    ringColorClass: "ring-blue-700/10",
    borderColorClass: "border-blue-100",
    hoverBorderColorClass: "hover:border-blue-300",
    hoverBgColorClass: "hover:bg-gradient-to-br hover:from-blue-50/10 hover:to-transparent",
    hoverTextColorClass: "group-hover:text-blue-700",
  },
  {
    id: "ciclo2",
    phase: "Fase 3",
    title: "Ciclo 2",
    description: "Segundo ciclo de seguimiento y evaluación intermedia.",
    icon: Calendar,
    colorClass: "text-indigo-600",
    bgColorClass: "bg-indigo-50",
    ringColorClass: "ring-indigo-700/10",
    borderColorClass: "border-indigo-100",
    hoverBorderColorClass: "hover:border-indigo-300",
    hoverBgColorClass: "hover:bg-gradient-to-br hover:from-indigo-50/10 hover:to-transparent",
    hoverTextColorClass: "group-hover:text-indigo-700",
  },
  {
    id: "final",
    phase: "Fase 4",
    title: "Ciclo Final",
    description: "Cierre del programa y evaluación final de impacto.",
    icon: Check,
    colorClass: "text-amber-600",
    bgColorClass: "bg-amber-50",
    ringColorClass: "ring-amber-700/10",
    borderColorClass: "border-amber-100",
    hoverBorderColorClass: "hover:border-amber-300",
    hoverBgColorClass: "hover:bg-gradient-to-br hover:from-amber-50/10 hover:to-transparent",
    hoverTextColorClass: "group-hover:text-amber-700",
  },
];

// Helper methods for progress and sequential blocking
const totalIndicatorsCount = AREAS_CONFIG.reduce(
  (sum, area) => sum + (area.indicators?.length || 0),
  0
);

const getMomentProgress = (momentId) => {
  const momentEval = store.evaluations?.[momentId];
  if (!momentEval || !momentEval.scores) return 0;
  let count = 0;
  AREAS_CONFIG.forEach((area) => {
    area.indicators.forEach((ind) => {
      const score = momentEval.scores[ind.key];
      if (score !== undefined && score !== null && score !== "") {
        count++;
      }
    });
  });
  return count;
};

const isMomentComplete = (momentId) => {
  return getMomentProgress(momentId) === totalIndicatorsCount;
};

const isMomentLocked = (momentId) => {
  if (momentId === "inicial") return false;
  if (momentId === "ciclo1") return !isMomentComplete("inicial");
  if (momentId === "ciclo2") return !isMomentComplete("ciclo1");
  if (momentId === "final") return !isMomentComplete("ciclo2");
  return false;
};

// Map dynamic component icons
const getAreaIcon = (iconName) => {
  const mapping = {
    Home,
    Megaphone,
    Cart,
    Archive,
    Coins,
    Book,
    Calendar,
  };
  return mapping[iconName] || Home;
};

// HSL color configurations for each area icon box
const getAreaColorClasses = (areaId) => {
  const colors = {
    1: "bg-rose-50 text-rose-600",
    2: "bg-blue-50 text-blue-600",
    3: "bg-amber-50 text-amber-600",
    4: "bg-purple-50 text-purple-600",
    5: "bg-green-50 text-green-600",
    6: "bg-indigo-50 text-indigo-600",
    7: "bg-teal-50 text-teal-600",
  };
  return colors[areaId] || "bg-gray-50 text-gray-600";
};

// Flow Navigation & actions
const selectMoment = (momentId) => {
  store.activeMoment = momentId;
};

const getMomentLabel = (momentId) => {
  const labels = {
    inicial: "Diagnóstico Inicial",
    ciclo1: "Ciclo 1",
    ciclo2: "Ciclo 2",
    final: "Ciclo Final",
  };
  return labels[momentId] || momentId;
};

const selectArea = (areaId) => {
  store.activeArea = areaId;
  store.activeIndicatorIndex = 0;
  isQuestionsExpanded.value = true;
  isSignalsExpanded.value = true;
};

const selectLevel = (levelVal) => {
  if (store.currentIndicator?.key) {
    store.setScore(store.currentIndicator.key, levelVal);
  }
};

const goBackToAreas = () => {
  store.resetFlow();
};

const handleClose = () => {
  store.resetFlow();
  emit("close");
};

const goPrevious = () => {
  if (store.activeIndicatorIndex === 0) {
    store.resetFlow();
  } else {
    store.activeIndicatorIndex--;
    isQuestionsExpanded.value = true;
    isSignalsExpanded.value = true;
  }
};

const goNext = async () => {
  const currentKey = store.currentIndicator?.key;
  const currentVal = store.diagnosticScores[currentKey];

  if (currentVal === undefined || currentVal === null) {
    toast.error(
      "Por favor, selecciona un nivel de desempeño antes de continuar",
    );
    return;
  }

  if (store.activeIndicatorIndex === 2) {
    // Es el último indicador del área
    try {
      await store.saveScoresForArea(props.businessId);
      store.resetFlow();
    } catch (err) {
      console.error(err);
    }
  } else {
    store.activeIndicatorIndex++;
    isQuestionsExpanded.value = true;
    isSignalsExpanded.value = true;
  }
};

onMounted(() => {
  store.resetFlow();
  store.loadScores(props.businessId);
  isQuestionsExpanded.value = true;
  isSignalsExpanded.value = true;
});
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
