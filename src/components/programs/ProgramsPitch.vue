<template>
  <section
    class="pt-10 pb-20 md:pb-32 px-4 relative overflow-hidden bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-orange-50/30"
  >
    <!-- Sombras sutiles de fondo -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <!-- Bloque principal: Título y contexto -->
      <div
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 md:p-16 mb-12 md:mb-20 text-center transition-all duration-200"
      >
        <!-- Eyebrow -->
        <div class="flex justify-center mb-8">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700"
          >
            <Community class="w-4 h-4" />
            <span class="text-sm font-medium">Juntos</span>
          </div>
        </div>

        <!-- Título Principal (H2) -->
        <h2
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 font-extrabold leading-[1.1] tracking-tight mb-8"
        >
          Emprender no termina cuando acaba la
          <span class="text-purple-600">sesión</span>.
        </h2>

        <!-- Subtexto -->
        <p
          class="text-xl sm:text-2xl md:text-3xl text-gray-600 leading-relaxed md:leading-relaxed max-w-4xl mx-auto mb-8"
          style="line-height: 1.6"
        >
          Con WALA, el acompañamiento
          <span class="font-semibold text-gray-800"
            >no se queda en la capacitación</span
          >.
        </p>

        <p
          class="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
          style="line-height: 1.6"
        >
          Te acompaña entre asesorías, te ayuda en tu negocio real, y te muestra
          tu progreso,
          <span class="font-semibold text-gray-800">no solo tu asistencia</span
          >.
        </p>
      </div>

      <!-- Mensaje adicional -->
      <div class="mb-12 text-center">
        <p
          class="text-2xl sm:text-3xl md:text-4xl text-gray-800 font-bold leading-tight mb-4"
        >
          Aquí no solo vienes a aprender.
        </p>
        <p
          class="text-xl sm:text-2xl md:text-3xl text-gray-700 leading-relaxed max-w-4xl mx-auto"
        >
          Tienes una
          <span class="font-semibold text-purple-600"
            >herramienta en tu celular</span
          >
          para ordenar tu negocio, registrar lo que pasa día a día y tomar
          mejores decisiones.
        </p>
      </div>

      <!-- Mensaje de crecimiento -->
      <div
        class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border border-blue-100 p-8 sm:p-10 md:p-12 mb-12 text-center"
      >
        <p
          class="text-2xl sm:text-3xl md:text-4xl text-gray-800 font-bold leading-tight mb-4"
        >
          Porque crecer no es solo escuchar una clase.
        </p>
        <p
          class="text-xl sm:text-2xl md:text-3xl text-gray-700 leading-relaxed"
        >
          Es
          <span class="font-semibold text-blue-600"
            >aplicar, revisar y mejorar</span
          >
          todos los días.
        </p>
      </div>

      <!-- CTAs: Dos opciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- CTA 1: Estás en un programa -->
        <div
          class="bg-white rounded-2xl shadow-lg border border-purple-200 p-8 sm:p-10 transition-all duration-200 hover:shadow-xl"
        >
          <div class="flex justify-center mb-6">
            <div
              class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center"
            >
              <Community class="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <h3
            class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center leading-tight"
          >
            ¿Estás participando en un programa de fortalecimiento?
          </h3>
          <p class="text-base text-gray-600 mb-6 text-center leading-relaxed">
            Ingresa con el código que te brindó tu organización aliada y accede
            a tu acompañamiento.
          </p>
          <div class="flex justify-center">
            <button
              @click="handleJoinProgram"
              class="w-full sm:w-auto bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-purple-700"
            >
              Ingresar con código
            </button>
          </div>
        </div>

        <!-- CTA 2: No estás en un programa -->
        <div
          class="bg-white rounded-2xl shadow-lg border border-blue-200 p-8 sm:p-10 transition-all duration-200 hover:shadow-xl"
        >
          <div class="flex justify-center mb-6">
            <div
              class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center"
            >
              <BrightCrown class="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <h3
            class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center leading-tight"
          >
            ¿Aún no estás en uno?
          </h3>
          <p class="text-base text-gray-600 mb-6 text-center leading-relaxed">
            Puedes usar WALA para organizar tu negocio o consultar si hay un
            programa disponible en tu distrito.
          </p>
          <div class="flex justify-center">
            <button
              @click="goToPremium"
              class="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-blue-700"
            >
              Ver WALA Premium
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje final -->
      <div
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 md:p-12 text-center"
      >
        <p
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight mb-6"
        >
          WALA es tu
          <span class="text-orange-500">copiloto empresarial</span>.
        </p>
        <p class="text-xl sm:text-2xl text-gray-700 leading-relaxed">
          No emprendes solo.
          <span class="font-semibold text-purple-600">Te acompañamos</span>.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { Community, BrightCrown, Union } from "@iconoir/vue";

const router = useRouter();
const route = useRoute();

// Emitir evento para abrir el modal desde el componente padre
const emit = defineEmits(["openJoinModal"]);

// Abrir modal de unirse a programa
const handleJoinProgram = () => {
  console.log("handleJoinProgram clicked"); // Debug
  emit("openJoinModal");
};

// Navegar a Premium
const goToPremium = () => {
  console.log("goToPremium clicked"); // Debug
  const businessId = route.params.businessId;
  console.log("businessId:", businessId); // Debug
  if (businessId) {
    router.push(`/business/${businessId}/premium`);
  } else {
    console.error("No businessId found in route params");
  }
};
</script>

<style scoped>
/* Transiciones suaves para cards */
.grid > div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.1;
  }
}

/* Animación de entrada para las cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div:nth-child(1) {
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.grid > div:nth-child(2) {
  animation: fadeInUp 0.6s ease-out 0.3s backwards;
}

.grid > div:nth-child(3) {
  animation: fadeInUp 0.6s ease-out 0.5s backwards;
}
</style>
