<template>
  <section
    id="planes-section"
    class="py-16 sm:py-20 px-4 relative overflow-hidden"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Contenedor principal tipo card (estilo HistorialRecords) -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 transition-all duration-200 hover:shadow-md hover:border-gray-200 mb-8"
      >
        <!-- Badge superior -->
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700"
          >
            <!-- <span class="text-2xl">💸</span> -->
            <span class="text-sm font-medium">Planes y Precios</span>
          </div>
        </div>

        <!-- Título Principal -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
        >
          Empieza <span class="text-emerald-600">gratis</span> y crece
          <span class="text-purple-600">a tu ritmo</span>
        </h2>

        <!-- Subtítulo -->
        <p
          class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 text-center font-normal leading-relaxed max-w-4xl mx-auto"
        >
          Sin letra pequeña. Tú decides
          <span class="font-medium text-gray-800"
            >cuándo dar el siguiente paso</span
          >.
        </p>
      </div>

      <!-- Grid de planes (3 columnas) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Plan 1: Gratis (Core) -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all duration-200 hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 relative"
        >
          <!-- Badge del plan -->
          <!-- <div class="flex justify-center mb-4">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700"
            >
              <span class="text-lg">🟢</span>
              <span class="text-xs font-semibold uppercase tracking-wide"
                >Gratis</span
              >
            </div>
          </div> -->

          <!-- Nombre del plan -->
          <h3
            class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center"
          >
            Básico
          </h3>

          <!-- Precio -->
          <div class="text-center mb-6">
            <span class="text-4xl sm:text-5xl font-bold text-emerald-600"
              >S/. 0</span
            >
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
            @click="selectPlan('gratis')"
            class="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Empezar gratis
          </button>
        </div>

        <!-- Plan 2: Emprendedor (Premium) - DESTACADO -->
        <div
          class="bg-white rounded-xl shadow-lg border-2 border-purple-300 p-8 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 relative"
        >
          <!-- Badge destacado -->
          <div
            class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md"
          >
            ⭐ Más popular
          </div>

          <!-- Badge del plan -->
          <!-- <div class="flex justify-center mb-4 mt-2">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700"
            >
              <span class="text-lg">🟣</span>
              <span class="text-xs font-semibold uppercase tracking-wide"
                >Pro</span
              >
            </div>
          </div> -->

          <!-- Nombre del plan -->
          <h3
            class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center"
          >
            Emprendedor
          </h3>

          <!-- Precio -->
          <div class="text-center mb-6">
            <span class="text-4xl sm:text-5xl font-bold text-purple-600"
              >S/. 29</span
            >
            <span class="text-base text-gray-500">/mes</span>
          </div>

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
            class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-600 hover:to-purple-700"
          >
            Probar 15 días gratis
          </button>
          <p class="text-xs text-center text-gray-500 mt-2">
            Sin tarjeta de crédito
          </p>
        </div>

        <!-- Plan 3: Institucional -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all duration-200 hover:shadow-lg hover:border-orange-300 hover:-translate-y-1 relative"
        >
          <!-- Badge del plan -->
          <!-- <div class="flex justify-center mb-4">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700"
            >
              <span class="text-lg">🟠</span>
              <span class="text-xs font-semibold uppercase tracking-wide"
                >Institucional</span
              >
            </div>
          </div> -->

          <!-- Nombre del plan -->
          <h3
            class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center"
          >
            Empresarial
          </h3>

          <!-- Precio -->
          <div class="text-center mb-6">
            <span class="text-3xl sm:text-4xl font-bold text-orange-600"
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
            class="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700"
          >
            Contactar ventas
          </button>
        </div>
      </div>

      <!-- Card destacada con beneficios universales -->
      <div
        class="rounded-xl p-8 mb-8 transition-all duration-200 hover:shadow-md"
      >
        <div class="text-center mb-6">
          <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Todos los planes incluyen
          </h3>
          <p class="text-base sm:text-lg text-gray-700">
            Beneficios garantizados sin importar el plan que elijas
          </p>
        </div>

        <!-- Grid de beneficios universales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0"
            >
              <Phone class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">
                Acceso desde celular
              </p>
              <p class="text-xs text-gray-500">iOS y Android</p>
            </div>
          </div>

          <div
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0"
            >
              <Shield class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Datos seguros</p>
              <p class="text-xs text-gray-500">Encriptación total</p>
            </div>
          </div>

          <div
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center shrink-0"
            >
              <MessageText class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Soporte básico</p>
              <p class="text-xs text-gray-500">Chat y email</p>
            </div>
          </div>

          <div
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <div
              class="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0"
            >
              <CloudSync class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">
                Sincronización automática
              </p>
              <p class="text-xs text-gray-500">Offline y online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Check, Phone, Shield, MessageText, CloudSync } from "@iconoir/vue";

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

const createAccount = () => {
  router.push("/auth/login");
};
</script>

<style scoped>
/* Estilos coherentes con Hero, Pain, Solution, Funcionalidades, PruebaSocial, FAQ y HistorialRecords */

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

/* Aplicar animación escalonada a los planes */
.grid > div:nth-child(1) {
  animation: fadeInUp 0.5s ease-out 0.1s backwards;
}

.grid > div:nth-child(2) {
  animation: fadeInUp 0.5s ease-out 0.2s backwards;
}

.grid > div:nth-child(3) {
  animation: fadeInUp 0.5s ease-out 0.3s backwards;
}

/* Transiciones suaves */
button,
.hover\:shadow-md,
.hover\:shadow-lg,
.hover\:shadow-xl {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(0);
}

/* Efecto especial para el plan destacado */
@keyframes pulse-border {
  0%,
  100% {
    border-color: rgb(216, 180, 254);
  }
  50% {
    border-color: rgb(192, 132, 252);
  }
}

.border-purple-300 {
  animation: pulse-border 3s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.2;
  }
}
</style>
