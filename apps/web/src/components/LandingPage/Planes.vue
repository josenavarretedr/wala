<template>
  <section id="planes-section" class="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Cabecera -->
      <div class="mb-12 lg:mb-16">
        <!-- Título Principal -->
        <h2
          class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-center"
        >
          Empieza <span class="text-emerald-600">gratis</span> y crece
          <span class="text-purple-600">a tu ritmo</span>
        </h2>

        <!-- Subtítulo ajustado -->
        <p
          class="text-lg lg:text-xl text-gray-600 text-center max-w-3xl mx-auto leading-relaxed"
        >
          Sin letra pequeña. Tú decides cuándo dar el siguiente paso.
        </p>
      </div>

      <!-- Grid de planes (3 columnas) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
        <!-- Plan 1: Básico -->
        <div
          class="bg-white rounded-xl border border-gray-200 p-8 transition-all duration-200 hover:border-emerald-300 relative"
        >
          <!-- Nombre del plan -->
          <h3 class="text-2xl font-bold text-gray-900 mb-2 text-center">
            Básico
          </h3>

          <!-- Precio -->
          <div class="text-center mb-6">
            <span class="text-5xl font-bold text-emerald-600">S/. 0</span>
            <span class="text-base text-gray-500">/mes</span>
          </div>

          <!-- Separador -->
          <div class="border-t border-gray-200 mb-6"></div>

          <!-- Features -->
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-emerald-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Registro básico de ventas y gastos</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-emerald-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Reportes diarios simples</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-emerald-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Guía educativa paso a paso</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-emerald-600" />
              </div>
              <span class="text-sm text-gray-700">Acceso desde celular</span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-emerald-600" />
              </div>
              <span class="text-sm text-gray-700">Soporte básico</span>
            </li>
          </ul>

          <!-- CTA -->
          <button
            @click="selectPlan('basic')"
            class="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-emerald-700"
          >
            Empieza sin costo
          </button>
        </div>

        <!-- Plan 2: Emprendedor (EL CORAZÓN DEL NEGOCIO) -->
        <div
          class="bg-white rounded-xl border-2 border-purple-300 shadow-md p-8 transition-all duration-200 hover:shadow-lg relative"
        >
          <!-- Badge destacado -->
          <div class="flex justify-center mb-4">
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white"
            >
              <span class="text-base">⭐</span>
              <span class="text-sm font-bold">Más popular</span>
            </div>
          </div>

          <!-- Nombre del plan -->
          <h3 class="text-2xl font-bold text-gray-900 mb-2 text-center">
            Emprendedor
          </h3>

          <!-- Precio -->
          <div class="text-center mb-3">
            <span class="text-5xl font-bold text-purple-600">S/. 29</span>
            <span class="text-base text-gray-500">/mes</span>
          </div>

          <!-- Subtítulo clave -->
          <p class="text-sm text-gray-600 text-center mb-6">
            Para quienes quieren control real de su negocio
          </p>

          <!-- Separador -->
          <div class="border-t border-gray-200 mb-6"></div>

          <!-- Features -->
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-purple-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-purple-600" />
              </div>
              <span class="text-sm text-gray-700 font-medium"
                >Todo lo del plan Gratis</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-purple-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-purple-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Reportes avanzados con gráficos</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-purple-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-purple-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Control de inventario completo</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-purple-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-purple-600" />
              </div>
              <span class="text-sm text-gray-700">Soporte prioritario</span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-purple-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-purple-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Exportar reportes en PDF</span
              >
            </li>
          </ul>

          <!-- CTA -->
          <button
            @click="selectPlan('premium')"
            class="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:bg-purple-700 mb-2"
          >
            Probar 15 días gratis
          </button>
          <p class="text-xs text-center text-gray-500">
            Sin tarjeta de crédito
          </p>
        </div>

        <!-- Plan 3: Empresarial (INSTITUCIONAL) -->
        <div
          class="bg-white rounded-xl border border-gray-200 p-8 transition-all duration-200 hover:border-gray-300 relative"
        >
          <!-- Nombre del plan -->
          <h3 class="text-2xl font-bold text-gray-900 mb-2 text-center">
            Empresarial
          </h3>

          <!-- Subtítulo -->
          <p class="text-sm text-gray-600 text-center mb-4">
            Soluciones para instituciones y programas
          </p>

          <!-- Precio -->
          <div class="text-center mb-6">
            <span class="text-3xl font-bold text-orange-600"
              >Personalizado</span
            >
          </div>

          <!-- Separador -->
          <div class="border-t border-gray-200 mb-6"></div>

          <!-- Features -->
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-orange-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Licencias para municipalidades</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-orange-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Acceso para ONGs y programas sociales</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-orange-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Panel de administración centralizado</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-orange-600" />
              </div>
              <span class="text-sm text-gray-700"
                >Capacitación personalizada</span
              >
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              >
                <Check class="w-3 h-3 text-orange-600" />
              </div>
              <span class="text-sm text-gray-700">Soporte dedicado 24/7</span>
            </li>
          </ul>

          <!-- CTA -->
          <button
            @click="contactSales"
            class="w-full border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-orange-50"
          >
            Contactar ventas
          </button>
        </div>
      </div>

      <!-- Micro-trust line -->
      <div class="text-center mb-8">
        <p class="text-sm text-gray-500">
          ✔ Acceso desde celular • ✔ Datos seguros • ✔ Soporte humano
        </p>
      </div>

      <!-- CTA final suave -->
      <div class="text-center">
        <p class="text-lg text-gray-700 leading-relaxed">
          Empieza hoy. Registra tu primer día. Decide después.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Check } from "@iconoir/vue";

const router = useRouter();

// Funciones para manejar los CTAs - todas redirigen a login
const selectPlan = (planType) => {
  router.push("/auth/login");
};

const contactSales = () => {
  // Para plan institucional, mantener WhatsApp
  window.open(
    "https://wa.me/51YOUR_PHONE_NUMBER?text=Hola,%20quiero%20información%20sobre%20el%20plan%20Institucional",
    "_blank"
  );
};
</script>

<style scoped>
/* Estilos coherentes con Solution.vue y Benefits.vue */

<style scoped>
/* Estilos coherentes con Solution.vue y Benefits.vue */

/* Transiciones suaves */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(0);
}
</style>
