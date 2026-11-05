<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/sessions';
import { SESSIONS_DATA, getSessionTitle, getSessionShortDesc } from '@/data/sessionsData';
import SyncStatusBadge from '@/components/common/SyncStatusBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import WalaActivationBridge from '@/components/common/WalaActivationBridge.vue';

const router = useRouter();
const authStore = useAuthStore();
const sessionStore = useSessionStore();

const participant = computed(() => authStore.currentParticipant);
const personalInfo = computed(() => participant.value?.personalInfo || {});
const businessInfo = computed(() => participant.value?.businessBasicInfo || {});

onMounted(async () => {
  if (participant.value?.dni) {
    await sessionStore.loadSessionsProgress(participant.value.dni);
    sessionStore.startParticipantProgressListener(participant.value.dni);
  }
});

onUnmounted(() => {
  sessionStore.stopParticipantProgressListener();
});

function getSessionState(sessionId) {
  const prog = sessionStore.getSessionProgressData(sessionId);
  if (!prog) return sessionId === 1 ? 'en_progreso' : 'bloqueado';
  return prog.state;
}

function handleSessionClick(session) {
  const state = getSessionState(session.id);
  if (state === 'bloqueado') return;
  router.push(`/sesiones/${session.id}`);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-between max-w-md mx-auto w-full border-x border-slate-200/50">
    <!-- Header Fijo Superior -->
    <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 pt-safe">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            🌱
          </div>
          <div>
            <h1 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">PlanSeed PWA</h1>
            <p class="text-sm font-bold text-slate-900 truncate max-w-[170px]">
              {{ businessInfo.commercialName || 'Mi Negocio' }}
            </p>
          </div>
        </div>

        <SyncStatusBadge />
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="flex-1 px-4 py-5 space-y-6">
      <!-- Tarjeta de Bienvenida del Emprendedor -->
      <section class="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-100 border border-blue-400/30">
              DNI: {{ participant?.dni }}
            </span>
            <span class="text-xs text-blue-200 font-medium">
              {{ participant?.cohortId || 'Cohorte Chiclayo' }}
            </span>
          </div>

          <h2 class="text-xl font-extrabold tracking-tight">
            Hola, {{ personalInfo.firstName || 'Emprendedor(a)' }}!
          </h2>
          <p class="text-blue-100 text-sm mt-1">
            {{ businessInfo.sector ? `${businessInfo.sector} • ${businessInfo.subSector || ''}` : 'Formulación de Plan de Negocio' }}
          </p>

          <!-- Barra de Progreso Global Reactiva -->
          <div class="mt-4 pt-3 border-t border-blue-600/50">
            <div class="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span>Progreso General del Programa</span>
              <span class="font-bold">{{ sessionStore.overallProgressPercentage }}%</span>
            </div>
            <div class="w-full bg-blue-950/40 rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: `${sessionStore.overallProgressPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      </section>

      <!-- Puente de Activación a Wala (Escalera de Valor) -->
      <section v-if="participant?.dni">
        <WalaActivationBridge
          :dni="participant.dni"
          :commercial-name="businessInfo.commercialName"
        />
      </section>

      <!-- Semáforo de Módulos Pedagógicos (1 al 8) -->
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900 tracking-tight">
            Ruta del Emprendedor (1 a 8)
          </h3>
          <span class="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            {{ sessionStore.completedSessionsCount }} de 8 completados
          </span>
        </div>

        <div class="space-y-2.5">
          <article
            v-for="session in SESSIONS_DATA"
            :key="session.id"
            @click="handleSessionClick(session)"
            class="flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99]"
            :class="[
              getSessionState(session.id) === 'completado'
                ? 'bg-white border-emerald-300 hover:border-emerald-400 shadow-xs'
                : '',
              getSessionState(session.id) === 'pendiente_revision'
                ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400 shadow-xs'
                : '',
              getSessionState(session.id) === 'en_progreso'
                ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-400/20 shadow-sm'
                : '',
              getSessionState(session.id) === 'bloqueado'
                ? 'bg-slate-50/70 border-slate-200 opacity-65 hover:opacity-85 cursor-not-allowed'
                : ''
            ]"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- Indicador visual del Semáforo -->
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform"
                :class="[
                  getSessionState(session.id) === 'completado'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : '',
                  getSessionState(session.id) === 'pendiente_revision'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : '',
                  getSessionState(session.id) === 'en_progreso'
                    ? 'bg-blue-600 text-white shadow-sm animate-pulse'
                    : '',
                  getSessionState(session.id) === 'bloqueado'
                    ? 'bg-slate-200 text-slate-400'
                    : ''
                ]"
              >
                <span v-if="getSessionState(session.id) === 'completado'">✓</span>
                <span v-else-if="getSessionState(session.id) === 'pendiente_revision'">⏳</span>
                <span v-else-if="getSessionState(session.id) === 'en_progreso'">{{ session.code }}</span>
                <span v-else>🔒</span>
              </div>

              <div class="min-w-0 text-left">
                <h4 class="text-sm font-bold text-slate-900 truncate">
                  {{ session.code }}: {{ getSessionTitle(session, businessInfo.businessNature) }}
                </h4>
                <p class="text-xs text-slate-500 truncate">
                  {{ getSessionShortDesc(session, businessInfo.businessNature) }}
                </p>
              </div>
            </div>

            <div class="shrink-0 ml-2">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
                :class="[
                  getSessionState(session.id) === 'completado'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : '',
                  getSessionState(session.id) === 'pendiente_revision'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : '',
                  getSessionState(session.id) === 'en_progreso'
                    ? 'bg-blue-600 text-white'
                    : '',
                  getSessionState(session.id) === 'bloqueado'
                    ? 'bg-slate-200 text-slate-500 text-[11px]'
                    : ''
                ]"
              >
                <template v-if="getSessionState(session.id) === 'completado'">Listo ✓</template>
                <template v-else-if="getSessionState(session.id) === 'pendiente_revision'">En revisión ⏳</template>
                <template v-else-if="getSessionState(session.id) === 'en_progreso'">Continuar →</template>
                <template v-else>Bloqueado</template>
              </span>
            </div>
          </article>
        </div>
      </section>

      <!-- Acción de Salida / Logout -->
      <section class="pt-2 border-t border-slate-200">
        <AppButton
          variant="outline"
          @click="handleLogout"
        >
          Cerrar Sesión Local
        </AppButton>
      </section>
    </main>

    <!-- Footer Mobile -->
    <footer class="bg-white border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500 pb-safe">
      <p>EmprendeApp v1.0 &bull; Datos persistidos localmente</p>
    </footer>
  </div>
</template>
