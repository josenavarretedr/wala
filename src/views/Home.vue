<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20"
    >
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          👉 Controla tu dinero. Haz crecer tu negocio.
        </h1>

        <div class="max-w-4xl mx-auto mb-10 space-y-4">
          <p class="text-xl md:text-2xl text-blue-100 font-medium">
            En Latinoamérica, millones de emprendedores trabajan duro, pero
            pierden oportunidades por no llevar un control real de sus finanzas.
          </p>
          <p class="text-lg md:text-xl text-blue-50">
            Con WALA, tienes claridad total en un solo lugar: ingresos, gastos,
            clientes y reportes.
          </p>
        </div>

        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <RouterLink
            to="/auth/register"
            class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg"
          >
            Comenzar gratis hoy
          </RouterLink>
          <RouterLink
            to="/auth/login"
            class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
          >
            INGRESA
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Sección 1: El Problema -->
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            📉 La realidad del emprendedor latinoamericano
          </h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">😰</span>
            </div>
            <p class="text-gray-700 font-medium">
              La mayoría no sabe con exactitud cuánto gana o gasta.
            </p>
          </div>

          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">🚫</span>
            </div>
            <p class="text-gray-700 font-medium">
              La informalidad cierra puertas al crédito y al crecimiento.
            </p>
          </div>

          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">📊</span>
            </div>
            <p class="text-gray-700 font-medium">
              Excel y cuadernos se pierden, se olvidan o confunden.
            </p>
          </div>

          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">💸</span>
            </div>
            <p class="text-gray-700 font-medium">
              Las apps existentes son caras, frías y no entienden nuestra
              realidad.
            </p>
          </div>
        </div>

        <div class="text-center mt-12">
          <p class="text-2xl font-bold text-red-600">
            👉 El resultado: mucho esfuerzo, poco control, cero oportunidades.
          </p>
        </div>
      </div>
    </section>

    <!-- Sección 2: La Solución (WALA) -->
    <section class="py-20 bg-blue-50">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            🔹 Simple. Accesible. Hecha para ti.
          </h2>
          <p class="text-xl text-gray-700 max-w-3xl mx-auto">
            WALA es la herramienta diseñada para el día a día del emprendedor
            latino:
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <div class="bg-white p-8 rounded-2xl shadow-lg">
            <div class="flex items-center mb-4">
              <div
                class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
              >
                <span class="text-2xl">✅</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900">
                Registra ingresos y egresos en segundos.
              </h3>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg">
            <div class="flex items-center mb-4">
              <div
                class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
              >
                <span class="text-2xl">✅</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900">
                Visualiza tus finanzas con reportes fáciles de entender.
              </h3>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg">
            <div class="flex items-center mb-4">
              <div
                class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
              >
                <span class="text-2xl">✅</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900">
                Construye historial financiero para acceder a crédito.
              </h3>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg">
            <div class="flex items-center mb-4">
              <div
                class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
              >
                <span class="text-2xl">✅</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900">
                Lleva tu negocio desde el celular, sin complicaciones.
              </h3>
            </div>
          </div>
        </div>

        <div class="text-center">
          <RouterLink
            to="/auth/register"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            Empieza a organizar tu negocio ahora
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Sección 3: Beneficios Claros -->
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">🔍</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">
              Claridad inmediata
            </h3>
            <p class="text-gray-700">
              Sabes en qué estás gastando y cuánto realmente ganas.
            </p>
          </div>

          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">🚀</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">
              Más oportunidades
            </h3>
            <p class="text-gray-700">
              Tu historial abre puertas a crédito y programas de apoyo.
            </p>
          </div>

          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">📈</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">
              Tu crecimiento, en orden
            </h3>
            <p class="text-gray-700">
              Del registro diario a la planeación mensual.
            </p>
          </div>

          <div class="text-center p-6">
            <div
              class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">🌎</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">
              Diseñado para LATAM
            </h3>
            <p class="text-gray-700">
              Fácil, económico y adaptado a tu realidad.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sección 4: Testimonio -->
    <section class="py-20 bg-gray-100">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <div class="bg-white p-12 rounded-2xl shadow-xl">
          <div
            class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span class="text-3xl">👩‍💼</span>
          </div>
          <blockquote
            class="text-2xl text-gray-700 font-medium mb-6 leading-relaxed"
          >
            "Antes trabajaba sin saber cuánto ganaba de verdad. Ahora con WALA
            llevo el control y puedo pensar en crecer."
          </blockquote>
          <cite class="text-lg text-blue-600 font-semibold"
            >— María, emprendedora en Piura</cite
          >
        </div>
      </div>
    </section>

    <!-- Sección 5: Planes -->
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Planes de WALA
          </h2>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Plan Emprendedor -->
          <div class="bg-blue-50 p-8 rounded-2xl border-2 border-blue-200">
            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">
                Plan Emprendedor
              </h3>
              <div class="text-4xl font-bold text-blue-600 mb-2">Gratis</div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center">
                <span class="text-green-500 mr-3">✅</span>
                <span class="text-gray-700">Registro de ingresos y gastos</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-500 mr-3">✅</span>
                <span class="text-gray-700">Reporte mensual básico</span>
              </li>
            </ul>
          </div>

          <!-- Plan Empresario -->
          <div
            class="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-2xl text-white relative"
          >
            <div
              class="absolute top-4 right-4 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-bold"
            >
              Recomendado
            </div>
            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold mb-2">Plan Empresario</h3>
              <div class="text-4xl font-bold mb-2">
                S/15-20<span class="text-lg">/mes</span>
              </div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center">
                <span class="text-green-300 mr-3">✅</span>
                <span>Reportes detallados</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-300 mr-3">✅</span>
                <span>Exportación de datos</span>
              </li>
              <li class="flex items-center">
                <span class="text-green-300 mr-3">✅</span>
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="text-center mt-12">
          <RouterLink
            to="/auth/register"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            Crear mi cuenta gratis
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Sección 6: Cierre fuerte -->
    <section
      class="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
    >
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-8">
          👉 "Miles de emprendedores en Latinoamérica están dando el salto. ¿Y
          tú?"
        </h2>

        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <RouterLink
            to="/auth/register"
            class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg"
          >
            Comenzar gratis hoy
          </RouterLink>
          <button
            class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
          >
            Solicitar demo para mi negocio
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center space-y-6">
          <div class="flex items-center justify-center space-x-3">
            <div
              class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white font-bold text-lg">W</span>
            </div>
            <span class="text-2xl font-bold text-white">WALA</span>
          </div>

          <p class="text-lg text-gray-400">
            Hecho en Perú, pensado para Latinoamérica.
          </p>

          <div class="flex justify-center space-x-8 text-sm">
            <a href="#" class="hover:text-white transition-colors"
              >Sobre nosotros</a
            >
            <a href="#" class="hover:text-white transition-colors">Contacto</a>
            <a href="#" class="hover:text-white transition-colors">Políticas</a>
          </div>

          <p class="text-sm text-gray-500 italic">
            "Construimos inclusión financiera desde abajo."
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// import { Wallet, EyeAlt, BarChart } from "@iconoir/vue";
</script>
