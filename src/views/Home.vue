<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <Hero></Hero>

    <!-- Sección 1: El Problema -->
    <Pain></Pain>
    <!-- Sección 2: La Solución (WALA) -->
    <Solution></Solution>

    <!-- Sección 3: Beneficios Claros -->
    <Wow></Wow>

    <!-- Sección 5: Planes -->
    <Planes></Planes>

    <!-- Sección 6: Cierre fuerte -->
    <CTA></CTA>

    <!-- Footer -->
    <FooterLandingPage></FooterLandingPage>
  </div>
</template>

<script setup>
import Hero from "@/components/LandingPage/Hero.vue";
import Pain from "@/components/LandingPage/Pain.vue";
import Solution from "@/components/LandingPage/Solution.vue";

import Wow from "@/components/LandingPage/Wow.vue";
import CTA from "../components/LandingPage/CTA.vue";
import Planes from "@/components/LandingPage/Planes.vue";
import FooterLandingPage from "@/components/LandingPage/FooterLandingPage.vue";
// import { Wallet, EyeAlt, BarChart } from "@iconoir/vue";
</script>
