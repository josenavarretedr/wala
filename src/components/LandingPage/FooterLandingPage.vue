<template>
  <footer
    class="bg-transparent border-t border-gray-100 py-12 lg:py-16 px-4 sm:px-6 lg:px-8 font-display"
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

        <!-- 2️⃣ BLOQUE SECCIONES -->
        <div>
          <h4 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Secciones</h4>
          <nav class="space-y-2.5">
            <a
              href="#hero-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Inicio
            </a>
            <a
              href="#pain-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Síntomas de caos
            </a>
            <a
              href="#testimonials-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Testimonios
            </a>
            <a
              href="#routes-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Elige tu camino
            </a>
            <a
              href="#how-section"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Cómo funciona
            </a>
          </nav>
        </div>

        <!-- 3️⃣ BLOQUE SOPORTE Y CONTACTO -->
        <div>
          <h4 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Contacto</h4>
          <nav class="space-y-2.5">
            <a
              href="mailto:hola@wala.lat"
              class="block text-sm text-gray-600 hover:text-[#E35336] transition-colors duration-200"
            >
              Escríbenos por correo
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=51921492993&text=Hola%20Jos%C3%A9%2C%20vi%20la%20p%C3%A1gina%20de%20WALA%20y%20tengo%20una%20consulta."
              target="_blank"
              rel="noopener noreferrer"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Soporte por WhatsApp
            </a>
            <router-link
              to="/auth/login"
              class="block text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              Iniciar sesión
            </router-link>
          </nav>
        </div>

        <!-- 4️⃣ BLOQUE LEGAL -->
        <div>
          <h4 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Legal</h4>
          <nav class="space-y-2.5">
            <router-link
              to="/legal/politica-privacidad"
              class="block text-sm text-gray-600 hover:text-[#E35336] transition-colors duration-200"
            >
              Política de privacidad
            </router-link>
            <router-link
              to="/legal/terminos-condiciones"
              class="block text-sm text-gray-600 hover:text-[#E35336] transition-colors duration-200"
            >
              Términos de servicio
            </router-link>
            <router-link
              to="/legal/politica-privacidad"
              class="block text-sm text-gray-600 hover:text-[#E35336] transition-colors duration-200"
            >
              Uso responsable de datos
            </router-link>
          </nav>
        </div>
      </div>

      <!-- BLOQUE SOPORTE (ANCHO COMPLETO) -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.06)] p-6 mb-8 text-center relative overflow-hidden">
        <div class="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
          <span class="text-gray-500 font-semibold">¿Necesitas soporte técnico o estratégico? Escríbenos a:</span>
          <a
            href="mailto:hola@wala.lat"
            class="text-[#E35336] hover:text-[#c2412b] font-black tracking-wide transition-colors duration-200"
          >
            hola@wala.lat
          </a>
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
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Transiciones suaves */
a, router-link {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
