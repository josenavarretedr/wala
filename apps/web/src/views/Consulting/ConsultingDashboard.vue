<template>
  <div class="min-h-screen flex flex-col pb-24">
    <!-- Header principal -->
    <header
      class="bg-white border-b border-gray-100 rounded-xl px-4 py-5 sm:px-6 lg:px-8 shadow-sm"
    >
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center gap-4">
          <div
            class="p-3 bg-[#E35336]/10 text-[#E35336] rounded-2xl shadow-inner transition-transform duration-300 hover:scale-105"
          >
            <SoilAlt class="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1
              class="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-display"
            >
              Asesoría WALA
              <span
                v-if="isAdminMode"
                class="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
                >Admin</span
              >
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              {{
                isAdminMode
                  ? "Panel de Control de Asesorías Empresariales"
                  : "Optimiza y gestiona el crecimiento y madurez de tu negocio"
              }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Indicador de Administrador -->
    <div
      v-if="isAdminMode && !loadingData && !showWizard"
      class="max-w-4xl w-full mx-auto mt-6 px-4 sm:px-6 lg:px-8"
    >
      <div
        class="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm"
      >
        <div class="flex items-center gap-4">
          <div
            class="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-inner flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p class="text-base font-extrabold text-indigo-950 font-display">
              Eres admin, aquí modificaremos los apartados de:
              <span class="text-indigo-600">{{
                businessName || "Negocio sin nombre"
              }}</span>
            </p>
            <p class="text-sm text-indigo-700/80 font-medium mt-0.5">
              Propiedad de:
              <span class="underline font-bold">{{
                ownerEmail || "Sin email registrado"
              }}</span>
            </p>
          </div>
        </div>
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 rounded-2xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-300 px-5 py-3 text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
        >
          Volver a Directorio
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="loadingData"
      class="flex-1 flex items-center justify-center p-12"
    >
      <div class="flex flex-col items-center gap-3">
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
        <span class="text-sm font-semibold text-gray-500"
          >Cargando información de asesoría...</span
        >
      </div>
    </div>

    <!-- Vista de Pestañas Normal -->
    <template v-else>
      <PerformanceMatrix
        v-if="showWizard"
        :businessId="businessId"
        @close="showWizard = false"
      />
      <CriticalAreasSelect
        v-else-if="showCriticalAreasWizard"
        :businessId="businessId"
        @close="
          showCriticalAreasWizard = false;
          loadConsultingData();
        "
      />
      <ActionPlanCreate
        v-else-if="showActionPlanWizard"
        :businessId="businessId"
        @close="
          showActionPlanWizard = false;
          loadConsultingData();
        "
      />
      <template v-else>
        <!-- Si el cliente está en "cero" (sin diagnóstico, madurez ni áreas críticas) y no es admin, mostramos el mix de marketing -->
        <template v-if="showEmptyMix">
          <div class="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          <!-- 1. Hero / Tarjeta de Diagnóstico Principal (Inspirada en TwoRoutes.vue) -->
          <div class="relative bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 sm:p-10 transition-all duration-300 font-display">
            <!-- Background glow effects -->
            <div class="absolute -top-12 -right-12 w-64 h-64 bg-[#E35336]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div class="flex-1 space-y-6">
                <!-- Badge -->
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E35336]/10 text-[#E35336] text-xs font-black tracking-wider uppercase animate-pulse">
                  <Binocular class="w-4 h-4 stroke-[2.5]" />
                  Asesoría Estratégica
                </div>

                <div class="space-y-3">
                  <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                    ¿Quieres saber qué está <span class="text-[#E35336]">frenando el crecimiento</span> de tu negocio hoy?
                  </h2>
                  <p class="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                    Agenda una sesión personalizada de <span class="text-gray-900 font-bold">20 minutos</span> uno a uno con José, metodólogo de WALA. Encontraremos la claridad que tu negocio necesita hoy mismo de forma totalmente gratuita.
                  </p>
                </div>

                <!-- Beneficios (Inspirado en TwoRoutes.vue) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div class="flex items-start gap-2.5">
                    <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <Check class="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">7 Áreas Evaluadas</h4>
                      <p class="text-[11px] text-gray-500 font-medium">Finanzas, costeo, inventario, marketing y más.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2.5">
                    <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <Check class="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">3 Frenos Reales</h4>
                      <p class="text-[11px] text-gray-500 font-medium">Identificamos con precisión tus cuellos de botella.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2.5">
                    <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <Check class="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Plan Concreto Incluido</h4>
                      <p class="text-[11px] text-gray-500 font-medium">Te vas con tareas claras y aplicables.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2.5">
                    <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <Check class="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">100% Sin Costo</h4>
                      <p class="text-[11px] text-gray-500 font-medium">Una llamada de alto impacto, sin compromisos.</p>
                    </div>
                  </div>
                </div>

                <!-- CTA Button -->
                <div class="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    @click="openWhatsApp"
                    class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#E35336] hover:bg-[#c2412b] text-white px-8 py-4 text-base font-extrabold shadow-lg shadow-[#E35336]/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                  >
                    Agendar Diagnóstico por WhatsApp
                    <ArrowRight class="w-5 h-5 stroke-[2.5]" />
                  </button>
                  
                  <span class="text-xs font-semibold text-gray-400 max-w-[200px] text-center sm:text-left leading-tight">
                    *Cupos limitados para esta semana
                  </span>
                </div>
              </div>

              <!-- Derecha: Garantía WALA -->
              <div class="w-full md:w-64 flex flex-col items-center justify-center shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                <div class="text-center space-y-4">
                  <div class="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 shadow-inner">
                    <SoilAlt class="w-10 h-10 stroke-[1.8]" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-black uppercase tracking-wider text-gray-400">Garantía de Claridad</p>
                    <p class="text-xs text-gray-600 font-semibold leading-relaxed">
                      Si en 2 meses de acompañamiento no tienes más claridad sobre tu negocio, <span class="text-gray-900 font-black">no te cobramos nada.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Proceso: Así es el Diagnóstico Gratuito (Inspirada en How.vue) -->
          <div class="space-y-8">
            <div class="text-center space-y-2">
              <h3 class="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Así es el diagnóstico gratuito
              </h3>
              <p class="text-sm text-gray-500 font-semibold max-w-lg mx-auto">
                Un proceso sencillo, transparente y diseñado al 100% para aportarte valor.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Paso 1 -->
              <div class="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 transition-all duration-300 hover:shadow-md">
                <div class="w-12 h-12 rounded-xl bg-[#E35336]/10 text-[#E35336] flex items-center justify-center shadow-inner">
                  <Calendar class="w-6 h-6 stroke-[2]" />
                </div>
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-[#E35336]">Paso 1</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span class="text-xs text-gray-400 font-bold">Agendar</span>
                  </div>
                  <h4 class="text-base font-extrabold text-gray-900">Coordinas la Sesión</h4>
                  <p class="text-xs text-gray-500 font-medium leading-relaxed">
                    Escríbenos por WhatsApp y coordinamos una reunión privada de <span class="text-gray-900 font-semibold">20 minutos</span> por videollamada esta semana.
                  </p>
                </div>
              </div>

              <!-- Paso 2 -->
              <div class="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 transition-all duration-300 hover:shadow-md">
                <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <GraphUp class="w-6 h-6 stroke-[2]" />
                </div>
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Paso 2</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span class="text-xs text-gray-400 font-bold">Diagnóstico</span>
                  </div>
                  <h4 class="text-base font-extrabold text-gray-900">Encontramos los Frenos</h4>
                  <p class="text-xs text-gray-500 font-medium leading-relaxed">
                    Evaluamos tu negocio en <span class="text-gray-900 font-semibold">7 áreas clave</span> y revelamos con precisión los <span class="text-blue-600 font-semibold">3 frenos principales</span> de tu crecimiento.
                  </p>
                </div>
              </div>

              <!-- Paso 3 -->
              <div class="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 transition-all duration-300 hover:shadow-md">
                <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <BookStack class="w-6 h-6 stroke-[2]" />
                </div>
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Paso 3</span>
                    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span class="text-xs text-gray-400 font-bold">Plan Claro</span>
                  </div>
                  <h4 class="text-base font-extrabold text-gray-900">Te llevas un Plan</h4>
                  <p class="text-xs text-gray-500 font-medium leading-relaxed">
                    Recibes un <span class="text-emerald-600 font-semibold">plan de acción de inmediato</span>. Tú decides si sigues acompañado en WALA Pro o aplicas el plan por tu cuenta.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Prueba Social: Testimonios (Inspirada en PruebaSocial.vue) -->
          <div class="space-y-8 border-t border-gray-100 pt-10">
            <div class="text-center space-y-2">
              <h3 class="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Lo que dicen los emprendedores que <span class="text-[#E35336]">ya pasaron por esto</span>
              </h3>
              <p class="text-sm text-gray-500 font-semibold max-w-lg mx-auto">
                Casos reales de transformación que empezaron con una sesión de 20 minutos.
              </p>
            </div>

            <!-- Carrusel de Testimonios -->
            <div class="relative max-w-2xl mx-auto">
              <!-- Card de Testimonio Activo -->
              <div class="relative min-h-[200px]">
                <Transition name="fade-slide" mode="out-in">
                  <div :key="currentTestimonialIndex" class="bg-gray-50/50 rounded-2xl border border-gray-150/50 p-6 sm:p-8 space-y-4">
                    <div class="w-10 h-10 bg-[#E35336]/10 text-[#E35336] rounded-xl flex items-center justify-center">
                      <User class="w-5 h-5 stroke-[2.2]" />
                    </div>
                    
                    <p class="text-base sm:text-lg text-gray-755 italic font-medium leading-relaxed" v-html="`“${testimonials[currentTestimonialIndex].quote}”`"></p>
                    
                    <div class="flex items-center justify-between pt-2">
                      <p class="text-xs sm:text-sm font-black text-gray-900">
                        — {{ testimonials[currentTestimonialIndex].author }}
                      </p>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Botones de Navegación del Carrusel -->
              <div class="flex justify-between items-center mt-6">
                <!-- Dots Indicadores -->
                <div class="flex gap-2">
                  <button
                    v-for="(t, index) in testimonials"
                    :key="index"
                    @click="currentTestimonialIndex = index"
                    class="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer animate-none"
                    :class="currentTestimonialIndex === index ? 'bg-[#E35336] w-6' : 'bg-gray-300 hover:bg-gray-400'"
                    :aria-label="`Ir al testimonio ${index + 1}`"
                  ></button>
                </div>

                <!-- Botones Prev/Next -->
                <div class="flex gap-2">
                  <button
                    @click="prevTestimonial"
                    class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all cursor-pointer"
                    aria-label="Testimonio anterior"
                  >
                    <NavArrowLeft class="w-4 h-4" />
                  </button>
                  <button
                    @click="nextTestimonial"
                    class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all cursor-pointer"
                    aria-label="Siguiente testimonio"
                  >
                    <NavArrowRight class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </template>

        <!-- Vista Normal de Pestañas (si tiene diagnóstico o es admin) -->
        <template v-else>
          <!-- Barra de Navegación por Pestañas (ItemsConsulting) -->
          <div class="max-w-7xl w-full mx-auto mt-4 px-4 sm:px-6 lg:px-8">
            <ItemsConsulting />
          </div>

          <!-- Contenido Principal -->
          <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div
              class="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-visible p-6 sm:p-10 min-h-[300px] transition-all duration-300 font-display"
            >
              <Transition name="fade-slide" mode="out-in">
                <!-- Sección: Resumen -->
                <div
                  v-if="activeTab === 'resumen'"
                  key="resumen"
                  class="space-y-10"
                >
                  <!-- 1. Nivel de Madurez Actual (ActualLevelCard) -->
                  <div class="space-y-4">
                    <div
                      class="flex items-center justify-between border-b border-gray-100 pb-3"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl"
                        >
                          <GraphUp class="w-5 h-5" />
                        </div>
                        <h3
                          class="text-base font-extrabold text-gray-800 uppercase tracking-wider"
                        >
                          Nivel de Madurez Actual
                        </h3>
                      </div>
                    </div>
                    <ActualLevelCard
                      :businessName="businessName || 'Tu Negocio'"
                      :registeredMoments="registeredMoments"
                      :evaluations="performanceStore.evaluations"
                    />
                  </div>

                  <!-- 2. Áreas Críticas Priorizadas (CriticalAreasSelected / Select Wizard button) -->
                  <div class="space-y-4">
                    <div
                      class="flex items-center justify-between border-b border-gray-100 pb-3"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl"
                        >
                          <WarningTriangle class="w-5 h-5" />
                        </div>
                        <h3
                          class="text-base font-extrabold text-gray-800 uppercase tracking-wider"
                        >
                          Áreas Críticas Priorizadas
                        </h3>
                      </div>
                      <button
                        v-if="isAdminMode && registeredMoments.length > 0"
                        @click="showCriticalAreasWizard = true"
                        class="inline-flex items-center gap-1.5 rounded-xl bg-[#E35336] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#c2412b] transition-all cursor-pointer"
                      >
                        <WarningTriangle class="w-3.5 h-3.5" />
                        Definir Áreas
                      </button>
                    </div>

                    <div
                      v-if="
                        dossierCriticalAreas && dossierCriticalAreas.length === 3
                      "
                    >
                      <CriticalAreasSelected
                        :criticalAreas="dossierCriticalAreas"
                      />
                    </div>

                    <!-- Empty state when no critical areas are defined yet -->
                    <div
                      v-else
                      class="bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-8 text-center space-y-4"
                    >
                      <div
                        class="mx-auto w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center shadow-inner"
                      >
                        <WarningTriangle class="w-6 h-6" />
                      </div>
                      <div class="space-y-1">
                        <h4
                          class="text-sm font-black text-gray-700 uppercase tracking-wider"
                        >
                          Sin Áreas Críticas Definidas
                        </h4>
                        <p
                          class="text-xs text-gray-450 font-semibold leading-relaxed max-w-sm mx-auto"
                        >
                          Aún no se han seleccionado ni documentado las 3 áreas
                          críticas priorizadas para el negocio.
                        </p>
                      </div>
                      <button
                        v-if="isAdminMode"
                        @click="showCriticalAreasWizard = true"
                        class="inline-flex items-center gap-2 rounded-2xl bg-[#E35336] hover:bg-[#c2412b] text-white px-5 py-3 text-xs font-bold shadow-md cursor-pointer transition-all duration-200"
                      >
                        Definir Áreas Críticas
                      </button>
                    </div>
                  </div>

                  <!-- 3. Plan de Acción (Acciones pendientes solamente) -->
                  <div class="space-y-4">
                    <div
                      class="flex items-center justify-between border-b border-gray-100 pb-3"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl"
                        >
                          <Calendar class="w-5 h-5" />
                        </div>
                        <h3
                          class="text-base font-extrabold text-gray-800 uppercase tracking-wider"
                        >
                          Plan de Acción (Pendientes)
                        </h3>
                      </div>
                    </div>
                    <ActionPlanView
                      :businessId="businessId"
                      :isAdminMode="isAdminMode"
                      :onlyPending="true"
                      @create-plan="showActionPlanWizard = true"
                    />
                  </div>
                </div>

                <!-- Sección: Niveles de Madurez -->
                <div
                  v-else-if="activeTab === 'madurez'"
                  key="madurez"
                  class="space-y-8"
                >
                  <!-- Header -->
                  <div
                    class="flex items-center justify-between border-b border-gray-100 pb-4 mb-2"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl">
                        <GraphUp class="w-6 h-6" />
                      </div>
                      <h2 class="text-lg font-bold text-gray-800">
                        Niveles de Madurez del Negocio
                      </h2>
                    </div>

                    <!-- Botón de guardar si es admin -->
                    <button
                      v-if="isAdminMode"
                      @click="showWizard = true"
                      class="inline-flex items-center gap-1.5 rounded-xl bg-[#E35336] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#c2412b] transition-all cursor-pointer"
                    >
                      <GraphUp class="w-3.5 h-3.5" />
                      Agregar o Guardar Desempeño
                    </button>
                  </div>

                  <!-- Maturity Level Assessment Card (Dynamic Component) -->
                  <ActualLevelCard
                    :businessName="businessName || 'Tu Negocio'"
                    :registeredMoments="registeredMoments"
                    :evaluations="performanceStore.evaluations"
                  />

                  <!-- Cycle summaries list (dynamic components) -->
                  <div v-if="registeredMoments.length > 0" class="space-y-8">
                    <ResumenPerformanceMatriz
                      v-for="momentId in reversedRegisteredMoments"
                      :key="momentId"
                      :momentId="momentId"
                      :scores="performanceStore.evaluations[momentId].scores"
                      :comments="
                        performanceStore.evaluations[momentId].comments || {}
                      "
                    />
                  </div>

                  <!-- Empty state when no cycles exist -->
                  <div
                    v-else
                    class="bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-8 text-center"
                  >
                    <GraphUp class="w-10 h-10 text-gray-400 mx-auto" />
                    <h4 class="text-sm font-extrabold text-gray-700 mt-3">
                      Sin evaluaciones registradas
                    </h4>
                    <p
                      class="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed"
                    >
                      Aún no se han evaluado los niveles de madurez de este
                      negocio en ningún ciclo.
                    </p>
                    <button
                      v-if="isAdminMode"
                      @click="showWizard = true"
                      class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#E35336] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[#c2412b] transition-all cursor-pointer"
                    >
                      Comenzar Evaluación
                    </button>
                  </div>
                </div>

                <!-- Sección: Áreas Críticas -->
                <div
                  v-else-if="activeTab === 'areas-criticas'"
                  key="areas-criticas"
                  class="space-y-6"
                >
                  <div
                    class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <WarningTriangle class="w-6 h-6" />
                      </div>
                      <h2 class="text-lg font-bold text-gray-800">
                        Áreas Críticas Identificadas
                      </h2>
                    </div>

                    <!-- Botón "Definir Áreas Críticas" si es admin y hay evaluaciones -->
                    <button
                      v-if="isAdminMode && registeredMoments.length > 0"
                      @click="showCriticalAreasWizard = true"
                      class="inline-flex items-center gap-1.5 rounded-xl bg-[#E35336] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#c2412b] transition-all cursor-pointer"
                    >
                      <WarningTriangle class="w-3.5 h-3.5" />
                      Definir Áreas Críticas
                    </button>
                  </div>

                  <!-- 1. BLOQUEO: Si no hay ninguna evaluación completa registrada -->
                  <div
                    v-if="registeredMoments.length === 0"
                    class="bg-amber-50/40 border border-amber-250/70 rounded-[24px] p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto"
                  >
                    <div
                      class="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-inner"
                    >
                      <WarningTriangle class="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div class="space-y-1.5">
                      <h4
                        class="text-sm font-black text-amber-950 uppercase tracking-wider"
                      >
                        Requiere Evaluación Completa
                      </h4>
                      <p
                        class="text-xs text-amber-700 font-semibold leading-relaxed"
                      >
                        Debes completar el diagnóstico de madurez (los 21
                        indicadores) en la pestaña "Niveles de Madurez" antes de
                        poder definir las áreas críticas prioritarias de este
                        negocio.
                      </p>
                    </div>
                    <button
                      v-if="isAdminMode"
                      @click="showWizard = true"
                      class="inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 px-5 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                    >
                      <GraphUp class="w-4 h-4" />
                      Ir a Niveles de Madurez
                    </button>
                  </div>

                  <!-- 2. VISTA: Si hay evaluaciones y las áreas críticas ya están definidas -->
                  <div
                    v-else-if="
                      dossierCriticalAreas && dossierCriticalAreas.length === 3
                    "
                  >
                    <CriticalAreasSelected
                      :criticalAreas="dossierCriticalAreas"
                    />
                  </div>

                  <!-- 3. EMPTY STATE: Si hay evaluaciones pero aún no se han definido las áreas críticas -->
                  <div
                    v-else
                    class="bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-8 text-center space-y-4"
                  >
                    <div
                      class="mx-auto w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center shadow-inner"
                    >
                      <WarningTriangle class="w-6 h-6" />
                    </div>
                    <div class="space-y-1">
                      <h4
                        class="text-sm font-black text-gray-700 uppercase tracking-wider"
                      >
                        Sin Áreas Críticas Definidas
                      </h4>
                      <p
                        class="text-xs text-gray-450 font-semibold leading-relaxed max-w-sm mx-auto"
                      >
                        Aún no se han seleccionado ni documentado las 3 áreas
                        críticas priorizadas para el negocio.
                      </p>
                    </div>
                    <button
                      v-if="isAdminMode"
                      @click="showCriticalAreasWizard = true"
                      class="inline-flex items-center gap-2 rounded-2xl bg-[#E35336] hover:bg-[#c2412b] text-white px-5 py-3 text-xs font-bold shadow-md cursor-pointer transition-all duration-200"
                    >
                      Definir Áreas Críticas
                    </button>
                  </div>
                </div>

                <!-- Sección: Plan de Acción -->
                <div
                  v-else-if="activeTab === 'plan-accion'"
                  key="plan-accion"
                  class="space-y-6"
                >
                  <div
                    class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl">
                        <SoilAlt class="w-6 h-6" />
                      </div>
                      <h2 class="text-lg font-bold text-gray-800">
                        Plan de Acción Wala
                      </h2>
                    </div>

                    <!-- Botones de administración -->
                    <div class="flex gap-2">
                      <button
                        v-if="isAdminMode"
                        @click="showActionPlanWizard = true"
                        class="inline-flex items-center gap-1.5 rounded-xl bg-[#E35336] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#c2412b] transition-all cursor-pointer"
                      >
                        <SoilAlt class="w-3.5 h-3.5" />
                        Crear Plan de Acción
                      </button>
                    </div>
                  </div>

                  <!-- Lista de acciones del plan -->
                  <div class="mt-6 pt-6 border-t border-gray-150">
                    <ActionPlanView
                      :businessId="businessId"
                      :isAdminMode="isAdminMode"
                      @create-plan="showActionPlanWizard = true"
                    />
                  </div>
                </div>
              </Transition>
            </div>
          </main>
        </template>
      </template>
    </template>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  SoilAlt,
  Reports,
  GraphUp,
  WarningTriangle,
  Leaf,
  Rocket,
  Group,
  BrightCrown,
  Calendar,
  ArrowRight,
  Binocular,
  Check,
  BookStack,
  User,
  NavArrowLeft,
  NavArrowRight,
} from "@iconoir/vue";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import ItemsConsulting from "@/components/consulting/ItemsConsulting.vue";
import PerformanceMatrix from "@/components/consulting/PerformanceMatrix.vue";
import ResumenPerformanceMatriz from "@/components/consulting/ResumenPerformanceMatriz.vue";
import CriticalAreasSelect from "@/components/consulting/CriticalAreasSelect.vue";
import CriticalAreasSelected from "@/components/consulting/CriticalAreasSelected.vue";
import ActionPlanCreate from "@/components/consulting/ActionPlanCreate.vue";
import ActionPlanView from "@/components/consulting/ActionPlanView.vue";
import ActualLevelCard from "@/components/consulting/ActualLevelCard.vue";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { usePerformanceStore, AREAS_CONFIG } from "@/stores/performanceStore";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const businessStore = useBusinessStore();
const performanceStore = usePerformanceStore();
const toast = useToast();

const showWizard = ref(false);
const showCriticalAreasWizard = ref(false);
const showActionPlanWizard = ref(false);
const dossierCriticalAreas = ref([]);

const activeTab = computed(() => route.query.tab || "resumen");

const ADMIN_EMAILS = ["josenavarretedr@gmail.com", "admin@wala.lat"];

const isAdminMode = computed(() => {
  return (
    route.meta.adminMode === true &&
    ADMIN_EMAILS.includes(authStore.user?.email)
  );
});

// Lógica de mix de marketing en estado vacío de diagnóstico
const showEmptyMix = computed(() => {
  return (
    !isAdminMode.value &&
    registeredMoments.value.length === 0 &&
    dossierCriticalAreas.value.length === 0
  );
});

// Carrusel de Testimonios
const currentTestimonialIndex = ref(0);
const testimonials = ref([
  {
    quote:
      "Pensé que mi problema era que vendía poco. En <span class='text-[#E35336] font-semibold'>20 minutos</span> José me mostró que el freno era el costeo — llevaba meses vendiendo <span class='text-[#E35336] font-semibold'>sin cubrir mis costos reales</span>.",
    author: "Estela R., Salón de Belleza, Chiclayo",
  },
  {
    quote:
      "El diagnóstico de 20 minutos con José me abrió los ojos. Descubrí que la falta de control de inventario estaba devorando mi flujo de caja.",
    author: "Carlos M., Minimarket, Trujillo",
  },
  {
    quote:
      "WALA y José me ayudaron a entender que mi negocio sí era rentable, pero mezclaba todo con mi caja personal. El plan de acción fue súper práctico.",
    author: "Sofía G., Marca de Ropa, Lima",
  }
]);

const nextTestimonial = () => {
  currentTestimonialIndex.value = (currentTestimonialIndex.value + 1) % testimonials.value.length;
};

const prevTestimonial = () => {
  currentTestimonialIndex.value =
    (currentTestimonialIndex.value - 1 + testimonials.value.length) %
    testimonials.value.length;
};

const openWhatsApp = () => {
  const whatsappLink =
    "https://api.whatsapp.com/send?phone=51921492993&text=Hola%20Jos%C3%A9%2C%20vi%20la%20p%C3%A1gina%20de%20WALA%20y%20quiero%20agendar%20mi%20diagn%C3%B3stico%20gratuito%20de%2020%20minutos.%20%C2%BFAgendamos%20para%20esta%20semana%3F";
  window.open(whatsappLink, "_blank", "noopener,noreferrer");
};

// Cycles fully completed with all 21 indicators
const registeredMoments = computed(() => {
  const moments = ["inicial", "ciclo1", "ciclo2", "final"];

  // Extract all 21 indicator keys from AREAS_CONFIG
  const allIndicatorKeys = AREAS_CONFIG.flatMap((area) =>
    area.indicators.map((ind) => ind.key),
  );
  return moments.filter((m) => {
    const scores = performanceStore.evaluations[m]?.scores;
    if (!scores) return false;
    return allIndicatorKeys.every(
      (key) =>
        scores[key] !== undefined && scores[key] !== null && scores[key] !== "",
    );
  });
});

// Moments in reverse chronological order (newest first) for rendering summaries
const reversedRegisteredMoments = computed(() => {
  return [...registeredMoments.value].reverse();
});

// ID del negocio activo (ruta para admin, Pinia para cliente)
const businessId = computed(() => {
  return (
    route.params.businessId ||
    authStore.user?.businessId ||
    businessStore.business?.id
  );
});

// Campos reactivos para nombre de negocio, dueño, textos y loading
const businessName = ref("");
const ownerEmail = ref("");
const resumenText = ref("NO TIENES REGISTROS ESPERADOS");
const madurezText = ref("Aquí tu diagnostico de tu negocio inicial");
const areasCriticasText = ref("Aquí tus tres áreas identificadas.");
const planAccionText = ref("Tu plan de acción Wala");
const loadingData = ref(false);
const savingData = ref(false);

const goBack = () => {
  router.push("/admin/users");
};

// Cargar datos del dossier y del negocio
const loadConsultingData = async () => {
  if (!businessId.value) return;
  loadingData.value = true;
  try {
    // 1. Cargar el dossier de asesoría
    const docRef = doc(
      db,
      "businesses",
      businessId.value,
      "consulting",
      "dossier",
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      resumenText.value = data.resumenText || "NO TIENES REGISTROS ESPERADOS";
      madurezText.value =
        data.madurezText || "Aquí tu diagnostico de tu negocio inicial";
      areasCriticasText.value =
        data.areasCriticasText || "Aquí tus tres áreas identificadas.";
      planAccionText.value = data.planAccionText || "Tu plan de acción Wala";
      dossierCriticalAreas.value = data.criticalAreas || [];
    } else {
      dossierCriticalAreas.value = [];
    }

    // 2. Cargar datos del negocio principal (nombre y gerente)
    const bizRef = doc(db, "businesses", businessId.value);
    const bizSnap = await getDoc(bizRef);
    if (bizSnap.exists()) {
      const data = bizSnap.data();
      businessName.value = data.nombre || data.businessName || data.name || "";
      if (data.email) {
        ownerEmail.value = data.email;
      }

      // Si tiene gerente asignado, cargamos el correo del gerente desde users
      if (data.gerenteId) {
        const userRef = doc(db, "users", data.gerenteId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          ownerEmail.value = userSnap.data().email || ownerEmail.value;
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar la información de asesoría:", error);
    toast.error("No se pudo cargar la información");
  } finally {
    loadingData.value = false;
  }
};

// Guardar los datos en el dossier de asesoría
const saveConsultingData = async () => {
  if (!businessId.value) return;
  savingData.value = true;
  try {
    const docRef = doc(
      db,
      "businesses",
      businessId.value,
      "consulting",
      "dossier",
    );
    await setDoc(
      docRef,
      {
        resumenText: resumenText.value,
        madurezText: madurezText.value,
        areasCriticasText: areasCriticasText.value,
        planAccionText: planAccionText.value,
        updatedAt: new Date(),
        updatedBy: authStore.user?.uid || "admin",
      },
      { merge: true },
    );

    // Actualizar el negocio con hasConsulting: true para indexación en filtros del directorio
    const bizRef = doc(db, "businesses", businessId.value);
    await setDoc(
      bizRef,
      {
        hasConsulting: true,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    toast.success("Asesoría guardada con éxito");
  } catch (error) {
    console.error("Error al guardar la asesoría:", error);
    toast.error("Error al guardar la asesoría");
  } finally {
    savingData.value = false;
  }
};

onMounted(() => {
  loadConsultingData();
  if (businessId.value) {
    performanceStore.loadScores(businessId.value);
  }
});
</script>

<script>
// Mantener el nombre del componente para transiciones o debugging
export default {
  name: "ConsultingDashboard",
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Transiciones de pestañas */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

textarea {
  resize: vertical;
}
</style>
