<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-orange-50/30 py-12 px-4"
  >
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <span class="text-sm font-medium">Premium</span>
          </div>
        </div>

        <h1
          class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
        >
          WALA <span class="text-orange-500">Premium</span>
        </h1>

        <p class="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
          Organiza tu negocio, entiende tus números y toma mejores decisiones
          con tu copiloto empresarial.
        </p>
      </div>

      <!-- Card principal -->
      <div
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 mb-8"
      >
        <div class="text-center mb-8">
          <p class="text-lg text-gray-600 mb-8">
            WALA Premium te brinda todas las herramientas para llevar el control
            financiero de tu negocio de forma simple y efectiva.
          </p>

          <!-- Características principales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1"
              >
                <svg
                  class="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">
                  Registro ilimitado
                </h3>
                <p class="text-sm text-gray-600">
                  Registra todos tus ingresos y egresos sin límites
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1"
              >
                <svg
                  class="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">
                  Reportes y análisis
                </h3>
                <p class="text-sm text-gray-600">
                  Visualiza el estado de tu negocio en tiempo real
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1"
              >
                <svg
                  class="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">
                  Control de inventario
                </h3>
                <p class="text-sm text-gray-600">
                  Gestiona tus productos y materiales
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-1"
              >
                <svg
                  class="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">
                  Cuentas por cobrar
                </h3>
                <p class="text-sm text-gray-600">
                  Lleva el control de tus clientes y cobros pendientes
                </p>
              </div>
            </div>
          </div>

          <!-- Precio -->
          <div
            class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 mb-8"
          >
            <div class="text-5xl font-extrabold text-gray-900 mb-2">
              S/ 29<span class="text-2xl text-gray-600 font-normal">/mes</span>
            </div>
            <p class="text-gray-600">Comienza con 15 días de prueba gratis</p>
          </div>

          <!-- CTA -->
          <button
            @click="goToPlans"
            class="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700"
          >
            Activar Premium
          </button>
        </div>
      </div>

      <!-- Mensaje sobre programas -->
      <div
        class="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 text-center"
      >
        <p class="text-gray-700 mb-4">
          ¿Sabías que puedes acceder a WALA Premium a través de un
          <span class="font-semibold text-purple-600"
            >programa de fortalecimiento empresarial</span
          >?
        </p>
        <button
          @click="goToPrograms"
          class="text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2"
        >
          Consultar programas disponibles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const businessStore = useBusinessStore();

const goToPlans = () => {
  const businessId = businessStore.currentBusinessId;
  if (businessId) {
    router.push(`/business/${businessId}/plans`);
  }
};

const goToPrograms = () => {
  const businessId = businessStore.currentBusinessId;
  if (businessId) {
    router.push(`/business/${businessId}/programs`);
  }
};
</script>

<style scoped>
/* Animaciones sutiles */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
