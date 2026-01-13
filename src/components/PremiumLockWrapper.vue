<template>
  <div :class="containerClasses">
    <!-- Slot para el header (siempre visible sin blur) -->
    <div v-if="$slots.header" class="header-section">
      <slot name="header"></slot>
    </div>

    <!-- Contenido principal con blur condicional -->
    <div @click="handleClick" :style="isLocked ? 'cursor: pointer;' : ''">
      <slot
        name="content"
        :contentClasses="contentClasses"
        :isLocked="isLocked"
      ></slot>
    </div>

    <!-- Badge Premium overlay cuando está bloqueado -->
    <div v-if="showBadge" :class="badgeOverlayClasses">
      <div :class="badgeClasses">
        <BrightCrown class="w-3.5 h-3.5" />
        <span>Premium</span>
      </div>
    </div>

    <!-- Slot fallback para cuando no está bloqueado -->
    <slot v-if="!isLocked" name="unlocked"></slot>
  </div>
</template>

<script setup>
import { BrightCrown } from "@iconoir/vue";
import { computed, watch } from "vue";

/**
 * 🎨 Componente Wrapper para contenido Premium
 *
 * Wrapper reutilizable que aplica blur, badge y gestión de clicks
 * a contenido que requiere suscripción Premium.
 *
 * @prop {Boolean} isPremium - Si el usuario tiene plan Premium (default: true)
 * @prop {Boolean} isLocked - Si el contenido debe estar bloqueado (default: false)
 * @prop {Boolean} clickable - Si debe emitir evento al hacer click cuando está bloqueado (default: true)
 *
 * @slot header - Contenido del encabezado (siempre visible, sin blur)
 * @slot content - Contenido principal (se aplica blur cuando isLocked=true)
 * @slot unlocked - Contenido mostrado solo cuando NO está bloqueado
 *
 * @event locked-click - Emitido cuando se hace click en contenido bloqueado
 *
 * @example
 * <PremiumLockWrapper
 *   :is-premium="isPremium"
 *   :is-locked="isLocked"
 *   @locked-click="showPremiumToast"
 * >
 *   <template #header>
 *     <h3>Título del Widget</h3>
 *   </template>
 *   <template #content>
 *     <p>Datos sensibles que se blurean</p>
 *   </template>
 * </PremiumLockWrapper>
 */
const props = defineProps({
  isPremium: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["locked-click"]);

// Debug: Observar cambios en isLocked
watch(
  () => props.isLocked,
  (newVal) => {
    console.log("🔒 PremiumLockWrapper - isLocked changed:", newVal);
    console.log(
      "🔒 contentClasses will be:",
      newVal ? "blur-sm select-none" : ""
    );
  },
  { immediate: true }
);

// Clases CSS calculadas directamente desde las props
const containerClasses = computed(() => "relative overflow-hidden");

const contentClasses = computed(() => {
  const classes = props.isLocked ? "blur-sm select-none" : "";
  console.log(
    "🎨 Computing contentClasses:",
    classes,
    "isLocked:",
    props.isLocked
  );
  return classes;
});

const showBadge = computed(() => props.isLocked);

const badgeOverlayClasses = computed(
  () => "absolute inset-0 flex items-center justify-center pointer-events-none"
);

const badgeClasses = computed(
  () =>
    "flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 text-xs font-semibold rounded-full shadow-lg"
);

/**
 * Maneja el click en contenido bloqueado
 * Emite evento para que el padre pueda mostrar toast contextual
 */
const handleClick = () => {
  if (props.isLocked && props.clickable) {
    emit("locked-click");
  }
};
</script>

<style scoped>
/* Estilos opcionales para mejorar la presentación */
.header-section {
  position: relative;
  z-index: 1;
}
</style>
