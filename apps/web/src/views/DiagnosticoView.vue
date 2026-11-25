<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
    <NavbarLanding variant="diagnostico" />
    <main>
      <DiagnosticoHero />
      <FiltroICP />
      <Matriz30Min />
      <ProgramaCiclos />
      <InstitutionalValidation variant="diagnostico" />
      <FiltroWhatsAppForm />
    </main>
    <FooterLandingPage class="bg-white" />
  </div>
</template>

<script setup>
import NavbarLanding from '@/components/LandingPage/NavbarLanding.vue';
import DiagnosticoHero from '@/components/Diagnostico/DiagnosticoHero.vue';
import FiltroICP from '@/components/Diagnostico/FiltroICP.vue';
import Matriz30Min from '@/components/Diagnostico/Matriz30Min.vue';
import ProgramaCiclos from '@/components/Diagnostico/ProgramaCiclos.vue';
import InstitutionalValidation from '@/components/LandingPage/InstitutionalValidation.vue';
import FiltroWhatsAppForm from '@/components/Diagnostico/FiltroWhatsAppForm.vue';
import FooterLandingPage from '@/components/LandingPage/FooterLandingPage.vue';
</script>
