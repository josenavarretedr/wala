<template>
  <header
    class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100"
  >
    <nav
      class="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4"
      aria-label="Navegación principal"
    >
      <!-- Home variant -->
      <template v-if="variant === 'home'">
        <router-link
          to="/"
          class="flex items-center gap-2 shrink-0 focus:outline-none"
        >
          <img
            :src="logoWalaOrigin"
            alt="WALA"
            class="w-8 h-8 object-contain"
          />
          <span
            class="font-display font-extrabold text-lg sm:text-xl tracking-tight text-gray-900"
          >
            WALA
          </span>
        </router-link>

        <div
          class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600"
        >
          <router-link
            :to="{ path: '/', hash: '#producto' }"
            class="hover:text-[#E35336] transition-colors whitespace-nowrap"
          >
            La App
          </router-link>
          <router-link
            :to="{ path: '/', hash: '#escalera' }"
            class="hover:text-[#E35336] transition-colors whitespace-nowrap"
          >
            Planes y Método
          </router-link>
          <router-link
            :to="DIAGNOSTICO_PATH"
            class="hover:text-[#E35336] transition-colors whitespace-nowrap"
          >
            Diagnóstico 1:1
          </router-link>
        </div>

        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Desktop / >= 640px -->
          <div class="hidden sm:inline-flex items-center gap-3">
            <router-link
              :to="LOGIN_PATH"
              class="text-sm font-semibold text-gray-700 hover:text-[#E35336] px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Iniciar sesión
            </router-link>
            <router-link
              :to="REGISTER_PATH"
              class="inline-flex items-center justify-center bg-[#E35336] hover:bg-[#c2412b] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm shadow-[#E35336]/20 transition-all whitespace-nowrap"
            >
              Crear cuenta gratis
            </router-link>
          </div>

          <!-- Mobile < 640px -->
          <div class="flex sm:hidden items-center gap-1.5">
            <router-link
              :to="LOGIN_PATH"
              class="text-xs font-semibold text-gray-700 hover:text-[#E35336] px-2.5 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Ingresar
            </router-link>
            <router-link
              :to="REGISTER_PATH"
              class="inline-flex items-center justify-center bg-[#E35336] hover:bg-[#c2412b] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-[#E35336]/20 transition-all whitespace-nowrap"
            >
              Gratis
            </router-link>
          </div>
        </div>
      </template>

      <!-- Diagnostico variant -->
      <template v-else>
        <router-link
          to="/"
          class="flex items-center gap-1.5 sm:gap-2 shrink-0 focus:outline-none"
        >
          <img
            :src="logoWalaOrigin"
            alt="WALA"
            class="w-7 h-7 sm:w-8 sm:h-8 object-contain"
          />
          <span
            class="font-display font-extrabold text-sm sm:text-lg tracking-tight text-gray-900 whitespace-nowrap"
          >
            WALA · Método
          </span>
        </router-link>

        <div class="flex items-center gap-2 sm:gap-4 shrink-0">
          <router-link
            to="/"
            class="hidden sm:inline-block text-sm font-medium text-gray-500 hover:text-[#E35336] transition-colors whitespace-nowrap"
          >
            ¿Buscas solo la app gratuita?
          </router-link>
          <router-link
            to="/"
            class="sm:hidden text-xs font-medium text-gray-500 hover:text-[#E35336] px-1.5 py-1.5 transition-colors whitespace-nowrap"
          >
            Ver app
          </router-link>
          <a
            href="#agendar"
            class="inline-flex items-center justify-center bg-[#E35336] hover:bg-[#c2412b] text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-2 rounded-xl shadow-sm shadow-[#E35336]/20 transition-all whitespace-nowrap"
          >
            Solicitar diagnóstico
          </a>
        </div>
      </template>
    </nav>
  </header>
</template>

<script setup>
import logoWalaOrigin from "@/assets/Wala Origin.png";
import {
  REGISTER_PATH,
  LOGIN_PATH,
  DIAGNOSTICO_PATH,
} from "@/config/ctaLinks";

defineProps({
  variant: {
    type: String,
    default: "home",
    validator: (value) => ["home", "diagnostico"].includes(value),
  },
});
</script>
