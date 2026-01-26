<template>
  <footer
    class="bg-slate-50 border-t border-slate-200 py-12 lg:py-16 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Grid principal: 5 bloques -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-10"
      >
        <!-- 1️⃣ BLOQUE MARCA -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white font-bold text-sm">W</span>
            </div>
            <span class="text-xl font-semibold text-gray-900">WALA</span>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">
            Mi copiloto empresarial para emprendedores latinoamericanos.
          </p>
          <p class="text-sm text-gray-700 font-medium">
            Construimos inclusión financiera desde abajo.
          </p>
        </div>

        <!-- 2️⃣ BLOQUE PRODUCTO -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-4">Producto</h4>
          <nav class="space-y-2.5">
            <a
              href="#how-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Cómo funciona
            </a>
            <a
              href="#planes-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Planes y precios
            </a>
            <a
              href="#features-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Funciones
            </a>
            <a
              href="#faq-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Preguntas frecuentes
            </a>
          </nav>
        </div>

        <!-- 3️⃣ BLOQUE COMPAÑÍA (INSTITUCIONAL) -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-4">Compañía</h4>
          <nav class="space-y-2.5">
            <a
              href="#"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Sobre nosotros
            </a>
            <a
              href="mailto:hola@wala.pe"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Contacto
            </a>
            <a
              href="#prueba-social-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Alianzas
            </a>
            <a
              href="#"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Impacto social
            </a>
          </nav>
        </div>

        <!-- 4️⃣ BLOQUE LEGAL -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
          <nav class="space-y-2.5">
            <a
              href="#"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Política de privacidad
            </a>
            <a
              href="#"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Términos de servicio
            </a>
            <a
              href="#"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Uso responsable de datos
            </a>
          </nav>
        </div>
      </div>

      <!-- BLOQUE SOPORTE (ANCHO COMPLETO) -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h4 class="text-sm font-semibold text-gray-900 mb-4">Soporte</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Email:</span>
            <a
              href="mailto:hola@wala.pe"
              class="text-orange-600 hover:text-orange-700 ml-1 font-medium"
            >
              hola@wala.pe
            </a>
          </div>
          <div>
            <span class="text-gray-500">WhatsApp:</span>
            <span class="text-gray-700 ml-1 font-medium">+51 999 888 777</span>
          </div>
          <div>
            <span class="text-gray-500">Horario:</span>
            <span class="text-gray-700 ml-1">Lun–Vie · 9am–6pm (GMT-5)</span>
          </div>
        </div>
      </div>

      <!-- Separador -->
      <div class="border-t border-slate-200 pt-6">
        <!-- Fila inferior -->
        <div
          class="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500"
        >
          <p>© 2025 WALA. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ en Perú para Latinoamérica</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer institucional para WALA
</script>

<style scoped>
/* Estilos coherentes con el resto de la landing */

/* Transiciones suaves */
a {
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
