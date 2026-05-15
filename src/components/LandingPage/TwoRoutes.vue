<template>
  <section class="py-20 md:py-28 px-4 bg-white">
    <div class="max-w-6xl mx-auto">
      <h2
        class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight text-center mb-12"
      >
        ¿Por dónde quieres empezar?
      </h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-lg bg-[#E35336]/10 flex items-center justify-center"
            >
              <Cash class="w-5 h-5 text-[#E35336]" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Quiero saber qué falla
              </h3>
              <p class="text-sm text-gray-600">en mi negocio</p>
            </div>
          </div>

          <p class="text-sm text-gray-700 mb-5">
            Diagnóstico gratuito de 20 min con José — metodólogo WALA
          </p>

          <div class="space-y-3 mb-6">
            <div class="flex items-start gap-2">
              <Check class="w-4 h-4 text-emerald-600 mt-1" />
              <span class="text-sm text-gray-700">7 áreas evaluadas</span>
            </div>
            <div class="flex items-start gap-2">
              <Check class="w-4 h-4 text-emerald-600 mt-1" />
              <span class="text-sm text-gray-700"
                >3 áreas críticas con nombre</span
              >
            </div>
            <div class="flex items-start gap-2">
              <Check class="w-4 h-4 text-emerald-600 mt-1" />
              <span class="text-sm text-gray-700">Plan concreto incluido</span>
            </div>
            <div class="flex items-start gap-2">
              <Check class="w-4 h-4 text-emerald-600 mt-1" />
              <span class="text-sm text-gray-700"
                >Sin costo, sin compromiso</span
              >
            </div>
          </div>

          <button
            class="w-full bg-[#E35336] text-white px-6 py-3 rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            @click="openWhatsApp"
          >
            <span class="inline-flex items-center gap-2">
              Agendar por WhatsApp
              <ArrowRight class="w-4 h-4" />
            </span>
          </button>

          <p class="text-xs text-gray-500 mt-3">
            Si en 2 meses de acompañamiento no tienes más claridad sobre tu
            negocio, no te cobro nada.
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"
            >
              <Wrench class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Quiero ordenar mi negocio
              </h3>
              <p class="text-sm text-gray-600">yo mismo</p>
            </div>
          </div>

          <p class="text-sm text-gray-700 mb-5">Accede a WALA gratis hoy</p>

          <p class="text-sm text-gray-700 mb-5">
            Registra ingresos, gastos, inventario y flujo de caja
          </p>

          <div class="space-y-3 mb-6">
            <div class="flex items-start gap-2">
              <Check class="w-4 h-4 text-emerald-600 mt-1" />
              <span class="text-sm text-gray-700">Sin tarjeta de crédito</span>
            </div>
            <div class="flex items-start gap-2">
              <Check class="w-4 h-4 text-emerald-600 mt-1" />
              <span class="text-sm text-gray-700">Empieza en 2 minutos</span>
            </div>
            <div class="flex items-start gap-2">
              <Check class="w-4 h-4 text-emerald-600 mt-1" />
              <span class="text-sm text-gray-700"
                >Funciona desde el celular</span
              >
            </div>
          </div>

          <button
            class="w-full border-2 border-[#E35336] text-[#E35336] px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-[#E35336]/10"
            @click="goToSignup"
          >
            <span class="inline-flex items-center gap-2">
              Crear mi cuenta gratis
              <ArrowRight class="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ArrowRight, Cash, Check, Wrench } from "@iconoir/vue";

const router = useRouter();
const whatsappLink =
  "https://api.whatsapp.com/send?phone=51921492993&text=Hola%20Jos%C3%A9%2C%20vi%20la%20p%C3%A1gina%20de%20WALA%20y%20quiero%20agendar%20mi%20diagn%C3%B3stico%20gratuito%20de%2020%20minutos.%20%C2%BFAgendamos%20para%20esta%20semana%3F";

const openWhatsApp = () => {
  window.open(whatsappLink, "_blank", "noopener,noreferrer");
};

const goToSignup = () => {
  router.push("/auth/login");
};
</script>
