<template>
  <div class="min-h-screen relative overflow-x-hidden">
    <!-- Capa de fondo fija de alta resolución (sin estirarse verticalmente) -->
    <div class="home-bg" :style="{ backgroundImage: `url(${bgWall})` }"></div>
    <!-- Velo blanco translúcido para legibilidad limpia estilo SaaS -->
    <div class="fixed inset-0 bg-white/85 -z-10 pointer-events-none"></div>

    <NavbarLanding variant="home" />

    <Hero />

    <InstitutionalValidation variant="home" />

    <Pain />

    <Funcionalidades />

    <EscaleraValor />

    <How />

    <PruebaSocial />

    <FAQ />

    <CTA />

    <FooterLandingPage />
  </div>
</template>

<script setup>
import { onMounted, nextTick } from "vue";
import NavbarLanding from "@/components/LandingPage/NavbarLanding.vue";
import Hero from "@/components/LandingPage/Hero.vue";
import InstitutionalValidation from "@/components/LandingPage/InstitutionalValidation.vue";
import Pain from "@/components/LandingPage/Pain.vue";
import Funcionalidades from "@/components/LandingPage/Funcionalidades.vue";
import EscaleraValor from "@/components/LandingPage/EscaleraValor.vue";
import How from "@/components/LandingPage/How.vue";
import PruebaSocial from "@/components/LandingPage/PruebaSocial.vue";
import FAQ from "@/components/LandingPage/FAQ.vue";
import CTA from "@/components/LandingPage/CTA.vue";
import FooterLandingPage from "@/components/LandingPage/FooterLandingPage.vue";
import bgWall from "@/assets/bg_wall.png";

onMounted(() => {
  nextTick(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    document.querySelectorAll(".scroll-fade-up").forEach((el) => {
      observer.observe(el);
    });
  });
});
</script>

<style scoped>
.home-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -20;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  /* GPU-accelerated layer for smooth scrolling performance on mobile */
  transform: translate3d(0, 0, 0);
  will-change: transform;
}
</style>
