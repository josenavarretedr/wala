<template>
  <footer
    class="bg-slate-800 text-slate-300 py-12 px-4 border-t border-slate-700/50"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Contenido principal del footer -->
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <!-- Columna 1: Logo y descripción -->
        <div class="text-center md:text-left">
          <div
            class="flex items-center justify-center md:justify-start gap-3 mb-4"
          >
            <div
              class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white font-bold text-sm">W</span>
            </div>
            <span class="text-xl font-light text-white">WALA</span>
          </div>
          <p
            class="text-sm font-light leading-relaxed max-w-xs mx-auto md:mx-0"
          >
            Tu copiloto empresarial para emprendedores latinoamericanos.
          </p>
        </div>

        <!-- Columna 2: Enlaces útiles -->
        <div class="text-center md:text-left">
          <h4
            class="text-white font-medium mb-4 text-sm uppercase tracking-wide"
          >
            Enlaces útiles
          </h4>
          <nav class="space-y-2">
            <a
              href="#"
              class="block text-sm hover:text-orange-400 transition-colors duration-200"
            >
              Sobre nosotros
            </a>
            <a
              href="#"
              class="block text-sm hover:text-orange-400 transition-colors duration-200"
            >
              Contacto
            </a>
            <a
              href="#"
              class="block text-sm hover:text-orange-400 transition-colors duration-200"
            >
              Políticas de privacidad
            </a>
            <a
              href="#"
              class="block text-sm hover:text-orange-400 transition-colors duration-200"
            >
              Términos de servicio
            </a>
          </nav>
        </div>

        <!-- Columna 3: Soporte -->
        <div class="text-center md:text-left">
          <h4
            class="text-white font-medium mb-4 text-sm uppercase tracking-wide"
          >
            Soporte
          </h4>
          <div class="space-y-2 text-sm">
            <p>
              <span class="text-slate-400">Email:</span>
              <a
                href="mailto:hola@wala.pe"
                class="text-orange-400 hover:text-orange-300 ml-1"
              >
                hola@wala.pe
              </a>
            </p>
            <p>
              <span class="text-slate-400">WhatsApp:</span>
              <span class="ml-1">+51 999 888 777</span>
            </p>
            <p class="text-xs text-slate-400 mt-3">
              Lunes a Viernes: 9am - 6pm (GMT-5)
            </p>
          </div>
        </div>
      </div>

      <!-- Separador -->
      <div class="border-t border-slate-700 pt-6">
        <!-- Fila inferior -->
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <!-- Copyright -->
          <div class="text-center md:text-left">
            <p class="text-sm text-slate-400">
              © 2025 WALA. Todos los derechos reservados.
            </p>
            <p class="text-xs text-slate-500 mt-1">
              Hecho con ❤️ en Perú para Latinoamérica
            </p>
          </div>

          <!-- Frase inspiracional minimalista -->
          <div class="text-center md:text-right">
            <p class="text-sm italic text-slate-400">
              "Construimos inclusión financiera
              <span class="text-orange-400">desde abajo</span>"
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer funcional y minimalista
</script>

<style scoped>
/* Transiciones suaves */
footer {
  transition: all 0.3s ease;
}

/* Hover effects minimalistas */
a:hover {
  transform: translateX(2px);
}

/* Responsive optimizado */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .md\:text-left {
    text-align: center !important;
  }

  .md\:justify-start {
    justify-content: center !important;
  }
}
</style>
