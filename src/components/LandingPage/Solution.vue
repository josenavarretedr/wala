<template>
  <section class="bg-white py-8 md:py-16 lg:py-20 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Título minimalista -->
      <div class="text-center mb-10 md:mb-16">
        <h1
          class="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-slate-800 mb-3 md:mb-6 leading-tight"
        >
          <span class="text-orange-600 font-medium">WALA</span>
          <span class="text-slate-600 block sm:inline"> junta todo</span>
        </h1>
        <p
          class="text-lg sm:text-xl md:text-3xl lg:text-4xl text-slate-500 font-light"
        >
          lo que necesitas
        </p>
      </div>

      <!-- Lista directa de beneficios -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-12 md:mb-20"
      >
        <!-- Beneficio 1 -->
        <div
          class="bg-slate-50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <div class="text-3xl mb-4 text-center">💰</div>
          <h3
            class="text-lg sm:text-xl font-semibold text-slate-800 mb-2 text-center leading-tight"
          >
            Caja diaria automática
          </h3>
          <p
            class="text-base sm:text-lg text-slate-600 font-light leading-relaxed text-center"
          >
            Registrás una venta en 3 toques
          </p>
        </div>

        <!-- Beneficio 2 -->
        <div
          class="bg-slate-50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <div class="text-3xl mb-4 text-center">📦</div>
          <h3
            class="text-lg sm:text-xl font-semibold text-slate-800 mb-2 text-center leading-tight"
          >
            Stock inteligente
          </h3>
          <p
            class="text-base sm:text-lg text-slate-600 font-light leading-relaxed text-center"
          >
            Te avisa antes de quedarte en cero
          </p>
        </div>

        <!-- Beneficio 3 -->
        <div
          class="bg-slate-50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <div class="text-3xl mb-4 text-center">💲</div>
          <h3
            class="text-lg sm:text-xl font-semibold text-slate-800 mb-2 text-center leading-tight"
          >
            Precios precisos
          </h3>
          <p
            class="text-base sm:text-lg text-slate-600 font-light leading-relaxed text-center"
          >
            Guías paso a paso para no perder plata
          </p>
        </div>

        <!-- Beneficio 4 -->
        <div
          class="bg-slate-50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <div class="text-3xl mb-4 text-center">📱</div>
          <h3
            class="text-lg sm:text-xl font-semibold text-slate-800 mb-2 text-center leading-tight"
          >
            Sin complicaciones
          </h3>
          <p
            class="text-base sm:text-lg text-slate-600 font-light leading-relaxed text-center"
          >
            Sin plantillas, sin Excel,hasta sin internet
          </p>
        </div>
      </div>

      <!-- Ejemplo práctico -->
      <div
        class="bg-slate-50 p-6 sm:p-8 lg:p-12 rounded-2xl mb-16 md:mb-20 border border-slate-100 shadow-sm"
      >
        <div class="text-center mb-6 sm:mb-8">
          <h3
            class="text-lg sm:text-xl lg:text-2xl font-medium text-slate-700 mb-2"
          >
            Tu copiloto te va a decir cosas como:
          </h3>
        </div>
        <div class="max-w-2xl mx-auto space-y-3 sm:space-y-4">
          <div
            class="bg-orange-50 p-4 sm:p-5 rounded-xl border border-orange-200"
          >
            <p
              class="text-base sm:text-lg text-slate-700 font-medium text-center"
            >
              "Nos quedan 4 botellas de 500 ml, ¿pedimos?"
            </p>
          </div>
          <div
            class="bg-orange-50 p-4 sm:p-5 rounded-xl border border-orange-200"
          >
            <p
              class="text-base sm:text-lg text-slate-700 font-medium text-center"
            >
              "Sube $2 al choripán, que tu margen está bajo"
            </p>
          </div>
        </div>
      </div>

      <!-- Mensaje principal mejorado -->
      <div class="text-center mb-12 md:mb-20">
        <div class="max-w-4xl mx-auto">
          <!-- Setup sutil -->
          <p
            class="text-sm md:text-base text-slate-400 font-light uppercase tracking-[0.15em] mb-8 md:mb-12"
          >
            Así de simple
          </p>

          <!-- Mensaje principal con impacto tipográfico -->
          <div class="relative">
            <!-- Línea principal fragmentada -->
            <div class="space-y-2 md:space-y-4 mb-6 md:mb-8">
              <h2 class="final-message-text text-slate-900">Tú manejas</h2>

              <div
                class="flex items-center justify-center space-x-6 md:space-x-8"
              >
                <div
                  class="w-12 md:w-20 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
                ></div>
                <span class="text-lg md:text-xl text-orange-600 font-medium"
                  >+</span
                >
                <div
                  class="w-12 md:w-20 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
                ></div>
              </div>

              <div class="space-y-1 md:space-y-2">
                <h3 class="final-accent-text text-orange-600">WALA</h3>
                <p
                  class="text-xl md:text-3xl lg:text-4xl text-slate-700 font-light tracking-wide"
                >
                  te marca el camino
                </p>
              </div>
            </div>

            <!-- Efectos de fondo -->
            <div class="absolute inset-0 final-message-glow"></div>
          </div>

          <!-- Punto final elegante -->
          <div class="mt-8 md:mt-12">
            <div
              class="w-2 h-2 bg-orange-600 rounded-full mx-auto opacity-60"
            ></div>
          </div>
        </div>
      </div>

      <!-- Call to Action minimalista -->
      <div class="text-center">
        <button
          class="bg-orange-600 hover:bg-orange-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
        >
          Empezar ahora
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
// Componente simplificado sin animaciones complejas
</script>

<style scoped>
/* Enhanced mobile-first typography */
h1 {
  font-size: 3rem; /* 48px - Increased from 40px */
  line-height: 1.1;
  letter-spacing: -0.02em;
}

h3 {
  font-size: 1.25rem; /* 20px - Increased from 18px */
  line-height: 1.3;
  letter-spacing: -0.01em;
}

p {
  font-size: 1.125rem; /* 18px - Increased from 16px */
  line-height: 1.6;
}

/* Small tablet (640px and up) */
@media (min-width: 640px) {
  h1 {
    font-size: 3.75rem; /* 60px */
    letter-spacing: -0.025em;
  }

  h3 {
    font-size: 1.5rem; /* 24px */
  }

  p {
    font-size: 1.25rem; /* 20px */
  }
}

/* Medium tablet (768px and up) */
@media (min-width: 768px) {
  h1 {
    font-size: 4.5rem; /* 72px */
    letter-spacing: -0.03em;
  }

  h3 {
    font-size: 1.625rem; /* 26px */
  }

  p {
    font-size: 1.375rem; /* 22px */
  }
}

/* Desktop and up (1024px+) */
@media (min-width: 1024px) {
  h1 {
    font-size: 5rem; /* 80px */
    letter-spacing: -0.04em;
  }

  h3 {
    font-size: 1.75rem; /* 28px */
  }

  p {
    font-size: 1.5rem; /* 24px */
  }
}

/* Enhanced mobile spacing and containers */
section {
  padding-left: 1rem;
  padding-right: 1rem;
}

.max-w-4xl {
  max-width: 100%;
}

@media (min-width: 640px) {
  section {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .max-w-4xl {
    max-width: 42rem;
  }
}

@media (min-width: 768px) {
  section {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .max-w-4xl {
    max-width: 56rem;
  }
}

/* Refined hover effects */
.grid > div {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid > div:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* Enhanced button effects */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(234, 88, 12, 0.25);
  min-height: 3.5rem; /* Better touch target for mobile */
}

button:hover {
  box-shadow: 0 8px 25px rgba(234, 88, 12, 0.4);
}

/* Improved readability */
h1 {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

/* Smooth animations for icons */
.group div {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Enhanced card shadows */
.bg-white {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Better mobile optimization */
@media (max-width: 640px) {
  /* Improved line heights for mobile */
  p {
    line-height: 1.6;
  }

  h1 {
    line-height: 1.2;
    font-size: 2.25rem !important; /* 36px */
  }

  /* Better mobile card spacing */
  .grid {
    gap: 0.75rem;
  }

  /* Optimize button for mobile */
  button {
    font-size: 1.125rem !important; /* 18px */
    padding: 0.875rem 1.5rem !important;
  }

  /* Better mobile text sizes */
  .text-lg {
    font-size: 1rem !important;
  }

  .text-xl {
    font-size: 1.125rem !important;
  }
}

/* Small mobile optimization */
@media (max-width: 480px) {
  h1 {
    font-size: 2rem !important; /* 32px */
  }

  .text-base {
    font-size: 0.95rem !important;
  }
}

/* ===============================
   HERO TEXT - Tipografía principal
   =============================== */
.hero-text {
  font-size: 2.5rem; /* 40px móvil */
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

@media (min-width: 640px) {
  .hero-text {
    font-size: 3.5rem; /* 56px tablet */
  }
}

@media (min-width: 768px) {
  .hero-text {
    font-size: 4.5rem; /* 72px */
  }
}

@media (min-width: 1024px) {
  .hero-text {
    font-size: 6rem; /* 96px desktop */
    letter-spacing: -0.04em;
  }
}

/* Sombra de fondo sutil */
.hero-shadow {
  background: radial-gradient(
    ellipse 60% 40% at center,
    rgba(251, 146, 60, 0.03) 0%,
    rgba(251, 146, 60, 0.01) 40%,
    transparent 70%
  );
  z-index: -1;
  transform: scale(1.2);
}

/* ===============================
   BENEFIT ITEMS - Grid elegante
   =============================== */
.benefit-item {
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: linear-gradient(
    145deg,
    rgba(248, 250, 252, 0.8) 0%,
    rgba(241, 245, 249, 0.4) 100%
  );
  border: 1px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.benefit-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(251, 146, 60, 0.3) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.benefit-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 8px 40px rgba(0, 0, 0, 0.08),
    0 16px 60px rgba(251, 146, 60, 0.1);
  border-color: rgba(251, 146, 60, 0.2);
}

.benefit-item:hover::before {
  opacity: 1;
}

.benefit-number {
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  text-align: center;
}

.benefit-number.special {
  color: #ea580c;
}

.benefit-title {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.benefit-title-special {
  font-size: 1.25rem; /* 20px */
  font-weight: 700;
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  letter-spacing: -0.01em;
}

/* Responsive para benefit items */
@media (min-width: 640px) {
  .benefit-item {
    padding: 2.5rem 2rem;
  }

  .benefit-title,
  .benefit-title-special {
    font-size: 1.375rem; /* 22px */
  }

  .benefit-number {
    font-size: 0.875rem; /* 14px */
  }
}

@media (min-width: 768px) {
  .benefit-title,
  .benefit-title-special {
    font-size: 1.5rem; /* 24px */
  }
}

/* ===============================
   SISTEMA TIPOGRÁFICO REFINADO
   =============================== */
.font-extralight {
  font-weight: 200;
}

.font-thin {
  font-weight: 100;
}

.font-light {
  font-weight: 300;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.font-extrabold {
  font-weight: 800;
}

/* Tracking refinado */
.tracking-tight {
  letter-spacing: -0.025em;
}

.tracking-wide {
  letter-spacing: 0.025em;
}

/* Leading system */
.leading-none {
  line-height: 1;
}

.leading-tight {
  line-height: 1.25;
}

/* ===============================
   MOBILE OPTIMIZATIONS
   =============================== */
@media (max-width: 640px) {
  .text-7xl {
    font-size: 2.5rem !important; /* 40px */
  }

  .text-5xl {
    font-size: 1.875rem !important; /* 30px */
  }

  .text-3xl {
    font-size: 1.5rem !important; /* 24px */
  }

  .text-2xl {
    font-size: 1.25rem !important; /* 20px */
  }

  .benefit-item {
    padding: 1.5rem 1rem;
  }

  .benefit-title,
  .benefit-title-special {
    font-size: 1.125rem !important; /* 18px */
  }
}

/* ===============================
   EFECTOS SUTILES Y SOMBRAS
   =============================== */
.text-slate-900 {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.text-slate-800 {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.text-slate-600 {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

/* Gradiente sutil en separador */
.bg-gradient-to-r {
  filter: drop-shadow(0 1px 2px rgba(251, 146, 60, 0.1));
}

/* ===============================
   MENSAJE FINAL - Tipografía Dramática
   =============================== */
.final-message-text {
  font-size: 2.25rem; /* 36px móvil */
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.08);
}

.final-accent-text {
  font-size: 3rem; /* 48px móvil */
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-shadow: 0 2px 6px rgba(234, 88, 12, 0.15),
    0 4px 16px rgba(234, 88, 12, 0.1), 0 8px 32px rgba(234, 88, 12, 0.05);
}

/* Glow effect sutil */
.final-message-glow {
  background: radial-gradient(
    ellipse 70% 50% at center,
    rgba(251, 146, 60, 0.04) 0%,
    rgba(251, 146, 60, 0.02) 30%,
    transparent 60%
  );
  z-index: -1;
  transform: scale(1.5);
  opacity: 0.8;
}

/* Responsive para mensaje final */
@media (min-width: 640px) {
  .final-message-text {
    font-size: 3rem; /* 48px */
  }

  .final-accent-text {
    font-size: 4rem; /* 64px */
  }
}

@media (min-width: 768px) {
  .final-message-text {
    font-size: 3.75rem; /* 60px */
  }

  .final-accent-text {
    font-size: 5rem; /* 80px */
    letter-spacing: -0.05em;
  }
}

@media (min-width: 1024px) {
  .final-message-text {
    font-size: 4.5rem; /* 72px */
    letter-spacing: -0.03em;
  }

  .final-accent-text {
    font-size: 6rem; /* 96px */
    letter-spacing: -0.06em;
  }
}

/* Hover effect sutil para interactividad */
.final-accent-text:hover {
  transform: scale(1.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile optimizations específicas */
@media (max-width: 640px) {
  .final-message-text {
    font-size: 1.875rem !important; /* 30px */
  }

  .final-accent-text {
    font-size: 2.5rem !important; /* 40px */
  }
}
</style>
