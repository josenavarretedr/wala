<template>
  <section
    class="wow-section relative min-h-screen bg-white py-16 md:py-24 px-4 overflow-hidden"
  >
    <!-- Sombras sutiles de fondo mejoradas -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute top-20 left-10 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-40"
      ></div>
      <div
        class="absolute bottom-32 right-16 w-96 h-96 bg-slate-50 rounded-full filter blur-3xl opacity-50"
      ></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
      <!-- Introducción Clara -->
      <div class="text-center mb-16 md:mb-20">
        <h1 class="wow-intro-text">
          Esto es lo que pasa cuando empezás con WALA:
        </h1>
      </div>

      <!-- Timeline Mobile-First - Clean & Elegant -->
      <div class="wow-timeline-container">
        <!-- Paso 1 -->
        <div class="wow-phase">
          <div class="wow-number-circle orange">
            <div class="wow-number-display">
              <span class="wow-big-number">1</span>
              <span class="wow-time-unit">día</span>
            </div>
          </div>

          <div class="wow-phase-result">
            <h3 class="wow-result-title">Ya sabés cuánto</h3>
            <p class="wow-result-highlight orange">ganaste hoy</p>
          </div>
        </div>

        <!-- Conector 1 -->
        <div class="wow-connector orange-to-blue">
          <div class="wow-connector-line"></div>
          <div class="wow-connector-arrow">↓</div>
        </div>

        <!-- Paso 2 -->
        <div class="wow-phase">
          <div class="wow-number-circle blue">
            <div class="wow-number-display">
              <span class="wow-big-number">2</span>
              <span class="wow-time-unit">sem</span>
            </div>
          </div>

          <div class="wow-phase-result">
            <h3 class="wow-result-title">Retomas el control de</h3>
            <p class="wow-result-highlight green">tu negocio</p>
          </div>
        </div>

        <!-- Conector 2 -->
        <div class="wow-connector blue-to-green">
          <div class="wow-connector-line"></div>
          <div class="wow-connector-arrow">↓</div>
        </div>

        <!-- Paso 3 -->
        <div class="wow-phase">
          <div class="wow-number-circle green">
            <div class="wow-number-display">
              <span class="wow-big-number">1</span>
              <span class="wow-time-unit">mes</span>
            </div>
          </div>

          <div class="wow-phase-result">
            <h3 class="wow-result-title">Dejas de sobrevivir</h3>
            <p class="wow-result-highlight blue">empieza tu gestión</p>
          </div>
        </div>
      </div>

      <!-- Conclusión WOW -->
      <div class="text-center mt-20 md:mt-28">
        <!-- Caja de transformación final -->
        <div class="wow-transformation-box">
          <h2 class="wow-transformation-setup">
            En solo 1 mes tu negocio cambia:
          </h2>

          <div class="wow-transformation-visual">
            <div class="wow-before-container">
              <span class="wow-before-text">Supervivencia</span>
              <div class="wow-before-indicator">😰</div>
            </div>

            <div class="wow-transformation-arrow">
              <span class="wow-arrow-symbol">→</span>
            </div>

            <div class="wow-after-container">
              <span class="wow-after-text">Control Total</span>
              <div class="wow-after-indicator">🚀</div>
            </div>
          </div>

          <p class="wow-transformation-promise">
            Esta es la <strong>promesa WALA</strong>
          </p>
        </div>

        <!-- CTA Ultra Directo -->
        <div class="mt-16 md:mt-20">
          <button class="wow-cta-button" @click="goToLogin">
            Quiero lo mejor para mi negocio ahora
          </button>

          <p class="wow-cta-subtitle">
            Empieza gratis • Sin compromisos • Resultados garantizados
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// Función para redirigir a login
const goToLogin = () => {
  router.push("/auth/login");
};
</script>

<style scoped>
/* ===============================
   WOW DESIGN - ULTRA LIMPIO
   =============================== */

/* Introducción */
.wow-intro-text {
  font-size: 1.875rem; /* 30px móvil - AUMENTADO */
  font-weight: 500;
  color: #475569; /* slate-600 */
  line-height: 1.4;
  text-align: center;
}

/* ===============================
   TIMELINE - MOBILE FIRST  
   =============================== */
.wow-timeline-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

/* ===============================
   FASES PRINCIPALES
   =============================== */
.wow-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  width: 100%;
}

/* ===============================
   CÍRCULOS DE NÚMEROS MEJORADOS
   =============================== */
.wow-number-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.wow-number-circle:hover {
  transform: translateY(-2px) scale(1.02);
}

.wow-number-circle.orange {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  border: 3px solid #ea580c;
}

.wow-number-circle.blue {
  background: linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%);
  border: 3px solid #2563eb;
}

.wow-number-circle.green {
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
  border: 3px solid #16a34a;
}

/* Números grandes dentro del círculo */
.wow-number-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.wow-big-number {
  font-size: 2.75rem; /* 44px - AUMENTADO */
  font-weight: 900;
  line-height: 1;
}

.wow-number-circle.orange .wow-big-number {
  color: #ea580c;
}

.wow-number-circle.blue .wow-big-number {
  color: #2563eb;
}

.wow-number-circle.green .wow-big-number {
  color: #16a34a;
}

.wow-time-unit {
  font-size: 0.875rem; /* 14px - AUMENTADO */
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ===============================
   RESULTADOS MEJORADOS
   =============================== */
.wow-phase-result {
  max-width: 250px;
  text-align: center;
}

.wow-result-title {
  font-size: 1.25rem; /* 20px - AUMENTADO */
  font-weight: 400;
  color: #475569;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.wow-result-highlight {
  font-size: 1.75rem; /* 28px - AUMENTADO */
  font-weight: 700;
  line-height: 1.3;
  display: block;
}

.wow-result-highlight.orange {
  color: #ea580c;
}

.wow-result-highlight.blue {
  color: #2563eb;
}

.wow-result-highlight.green {
  color: #16a34a;
}

/* ===============================
   CONECTORES ELEGANTES - MOBILE FIRST
   =============================== */
.wow-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  position: relative;
}

.wow-connector-line {
  width: 4px;
  height: 40px;
  border-radius: 3px;
  position: relative;
}

.wow-connector.orange-to-blue .wow-connector-line {
  background: linear-gradient(180deg, #ea580c 0%, #2563eb 100%);
}

.wow-connector.blue-to-green .wow-connector-line {
  background: linear-gradient(180deg, #2563eb 0%, #16a34a 100%);
}

.wow-connector-arrow {
  font-size: 2rem;
  font-weight: 900;
  margin-top: -8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.wow-connector.orange-to-blue .wow-connector-arrow {
  color: #2563eb;
}

.wow-connector.blue-to-green .wow-connector-arrow {
  color: #16a34a;
}

/* Highlights de Color */
.wow-highlight-orange {
  color: #ea580c; /* orange-600 */
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(234, 88, 12, 0.1);
}

.wow-highlight-blue {
  color: #2563eb; /* blue-600 */
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
}

.wow-highlight-green {
  color: #16a34a; /* green-600 */
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(22, 163, 74, 0.1);
}

/* ===============================
   TRANSFORMACIÓN FINAL - MOBILE FIRST
   =============================== */
.wow-transformation-box {
  background: linear-gradient(135deg, #fff7ed 0%, #f8fafc 100%);
  border: 3px solid #ea580c;
  border-radius: 2rem;
  padding: 2rem 1.5rem;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 12px 40px rgba(234, 88, 12, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.wow-transformation-setup {
  font-size: 1.375rem; /* 22px - AUMENTADO */
  color: #475569;
  margin-bottom: 2rem;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
}

.wow-transformation-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 2.5rem 0;
}

.wow-before-container,
.wow-after-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.wow-before-text {
  font-size: 1.5rem; /* 24px - AUMENTADO */
  color: #ef4444;
  font-weight: 500;
  text-decoration: line-through;
  opacity: 0.8;
  text-decoration-thickness: 2px;
}

.wow-before-indicator {
  font-size: 1.5rem;
  opacity: 0.7;
}

.wow-arrow-symbol {
  font-size: 2.5rem; /* 40px - AUMENTADO */
  color: #ea580c;
  font-weight: 900;
  text-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);
  margin: 0.5rem 0;
}

.wow-after-text {
  font-size: 1.75rem; /* 28px - AUMENTADO */
  color: #16a34a;
  font-weight: 800;
  text-shadow: 0 2px 6px rgba(22, 163, 74, 0.15);
  line-height: 1.2;
}

.wow-after-indicator {
  font-size: 1.5rem;
}

.wow-transformation-promise {
  font-size: 1.25rem; /* 20px - AUMENTADO */
  color: #334155;
  margin-top: 2rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
}

/* ===============================
   CTA ULTRA DIRECTO - MOBILE FIRST
   =============================== */
.wow-cta-button {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
  color: white;
  font-size: 1.25rem; /* 20px - AUMENTADO */
  font-weight: 700;
  padding: 1.25rem 2rem;
  border: none;
  border-radius: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(234, 88, 12, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: block;
  margin: 0 auto;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.3;
  min-width: 280px;
  position: relative;
  overflow: hidden;
}

.wow-cta-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.wow-cta-button:hover::before {
  left: 100%;
}

.wow-cta-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px rgba(234, 88, 12, 0.45), 0 6px 16px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.wow-cta-subtitle {
  font-size: 1rem; /* 16px - AUMENTADO */
  color: #64748b;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  max-width: 300px;
  margin: 0 auto;
}

/* ===============================
   RESPONSIVE DESIGN - MOBILE FIRST
   =============================== */
@media (min-width: 640px) {
  .wow-intro-text {
    font-size: 2.125rem; /* 34px */
  }

  .wow-timeline-container {
    gap: 2rem;
    max-width: 600px;
  }

  .wow-number-circle {
    width: 140px;
    height: 140px;
  }

  .wow-big-number {
    font-size: 3.25rem; /* 52px */
  }

  .wow-time-unit {
    font-size: 1rem; /* 16px */
  }

  .wow-result-title {
    font-size: 1.375rem; /* 22px */
  }

  .wow-result-highlight {
    font-size: 2rem; /* 32px */
  }

  .wow-connector-line {
    height: 45px;
    width: 5px;
  }

  .wow-connector-arrow {
    font-size: 2.25rem;
  }

  .wow-cta-button {
    font-size: 1.25rem;
    padding: 1.25rem 2.75rem;
  }

  .wow-transformation-visual {
    flex-wrap: nowrap;
    gap: 1.5rem;
  }

  .wow-transformation-box {
    max-width: 550px;
    padding: 2.5rem 2rem;
  }

  .wow-transformation-setup {
    font-size: 1.5rem; /* 24px */
  }

  .wow-transformation-visual {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }

  .wow-before-text {
    font-size: 1.625rem; /* 26px */
  }

  .wow-arrow-symbol {
    font-size: 3rem; /* 48px */
  }

  .wow-after-text {
    font-size: 2rem; /* 32px */
  }

  .wow-transformation-promise {
    font-size: 1.375rem; /* 22px */
  }

  .wow-cta-button {
    font-size: 1.375rem; /* 22px */
    padding: 1.375rem 2.5rem;
    min-width: 320px;
  }

  .wow-cta-subtitle {
    font-size: 1.125rem; /* 18px */
    max-width: 400px;
  }
}

@media (min-width: 768px) {
  .wow-intro-text {
    font-size: 2.5rem; /* 40px */
  }

  .wow-number-circle {
    width: 160px;
    height: 160px;
  }

  .wow-big-number {
    font-size: 3.75rem; /* 60px */
  }

  .wow-time-unit {
    font-size: 1.125rem; /* 18px */
  }

  .wow-result-title {
    font-size: 1.5rem; /* 24px */
  }

  .wow-result-highlight {
    font-size: 2.25rem; /* 36px */
  }

  .wow-connector-line {
    height: 50px;
    width: 6px;
  }

  .wow-connector-arrow {
    font-size: 2.5rem;
  }

  .wow-transformation-box {
    padding: 3rem 2.5rem;
    max-width: 650px;
  }

  .wow-transformation-setup {
    font-size: 1.75rem; /* 28px */
  }

  .wow-transformation-visual {
    gap: 2.5rem;
    margin: 3rem 0;
  }

  .wow-before-text {
    font-size: 1.875rem; /* 30px */
  }

  .wow-arrow-symbol {
    font-size: 3.5rem; /* 56px */
    margin: 0;
  }

  .wow-after-text {
    font-size: 2.25rem; /* 36px */
  }

  .wow-transformation-promise {
    font-size: 1.5rem; /* 24px */
  }

  .wow-cta-button {
    font-size: 1.5rem; /* 24px */
    padding: 1.5rem 3rem;
    min-width: 360px;
  }

  .wow-cta-subtitle {
    font-size: 1.25rem; /* 20px */
    max-width: 500px;
  }
}

@media (min-width: 1024px) {
  .wow-intro-text {
    font-size: 2.25rem; /* 36px */
  }

  .wow-timeline-container {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    grid-template-rows: 1fr;
    align-items: center;
    gap: 2rem;
    max-width: 1200px;
  }

  .wow-phase:nth-child(1) {
    grid-column: 1;
  }
  .wow-phase:nth-child(3) {
    grid-column: 3;
  }
  .wow-phase:nth-child(5) {
    grid-column: 5;
  }

  .wow-connector:nth-child(2) {
    grid-column: 2;
  }
  .wow-connector:nth-child(4) {
    grid-column: 4;
  }

  .wow-connector {
    flex-direction: row;
    margin: 0;
  }

  .wow-connector-line {
    width: 60px;
    height: 3px;
  }

  .wow-connector-arrow {
    margin-top: 0;
    margin-left: -2px;
    transform: rotate(-90deg);
  }

  .wow-number-circle {
    width: 180px;
    height: 180px;
  }

  .wow-big-number {
    font-size: 4.25rem; /* 68px */
  }

  .wow-time-unit {
    font-size: 1.25rem; /* 20px */
  }

  .wow-result-title {
    font-size: 1.625rem; /* 26px */
  }

  .wow-result-highlight {
    font-size: 2.5rem; /* 40px */
  }

  .wow-connector-line {
    width: 80px;
    height: 4px;
  }

  .wow-connector-arrow {
    font-size: 2.75rem;
    margin-left: -4px;
  }

  .wow-transformation-box {
    max-width: 750px;
    padding: 3.5rem 3rem;
  }

  .wow-transformation-setup {
    font-size: 2rem; /* 32px */
  }

  .wow-transformation-visual {
    gap: 3rem;
    margin: 3.5rem 0;
  }

  .wow-before-text {
    font-size: 2.125rem; /* 34px */
  }

  .wow-arrow-symbol {
    font-size: 4rem; /* 64px */
  }

  .wow-after-text {
    font-size: 2.5rem; /* 40px */
  }

  .wow-before-indicator,
  .wow-after-indicator {
    font-size: 2rem;
  }

  .wow-transformation-promise {
    font-size: 1.75rem; /* 28px */
    margin-top: 2.5rem;
  }

  .wow-cta-button {
    font-size: 1.75rem; /* 28px */
    padding: 1.75rem 3.5rem;
    min-width: 400px;
  }

  .wow-cta-subtitle {
    font-size: 1.375rem; /* 22px */
    max-width: 600px;
  }
}

/* ===============================
   ANIMACIONES SUAVES
   =============================== */
.wow-section {
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animación secuencial para los steps */
.wow-step:nth-child(1) {
  animation-delay: 0.2s;
}
.wow-step:nth-child(2) {
  animation-delay: 0.4s;
}
.wow-step:nth-child(3) {
  animation-delay: 0.6s;
}

.wow-step {
  animation: slideInStep 0.8s ease-out both;
}

@keyframes slideInStep {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
