<template>
  <div class="feature-gate">
    <!-- ✅ Contenido desbloqueado -->
    <div v-if="hasAccessToFeature" class="feature-unlocked">
      <slot></slot>
    </div>

    <!-- 🔒 Contenido bloqueado -->
    <div v-else class="feature-locked">
      <slot name="locked">
        <!-- UI por defecto cuando está bloqueado -->
        <div
          class="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all hover:border-gray-400"
          :class="sizeClasses"
        >
          <!-- Icono de bloqueo -->
          <div class="mb-4">
            <span class="text-5xl">🔒</span>
          </div>

          <!-- Título -->
          <h3 class="text-xl font-semibold text-gray-800 mb-2">
            {{ computedTitle }}
          </h3>

          <!-- Descripción -->
          <p class="text-gray-600 mb-6 max-w-md mx-auto">
            {{ computedDescription }}
          </p>

          <!-- Badge Premium -->
          <div class="mb-6 flex justify-center">
            <span
              class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg"
            >
              <span>👑</span>
              <span>Función Premium</span>
            </span>
          </div>

          <!-- Botón de upgrade -->
          <button
            v-if="showUpgradeButton"
            @click="handleUpgrade"
            class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            ✨ Actualizar a Premium
          </button>

          <!-- Slot para botón personalizado -->
          <slot name="actions"></slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSubscription } from "@/composables/useSubscription";

/**
 * 🚪 Componente FeatureGate - Control de acceso a funcionalidades premium
 *
 * Este componente muestra u oculta contenido basado en si el negocio
 * tiene acceso a una feature específica. Si no tiene acceso, muestra
 * una UI bloqueada con opción de upgrade.
 *
 * @component
 * @example
 * <!-- Uso básico -->
 * <FeatureGate feature="advancedReports">
 *   <AdvancedReportsPanel />
 * </FeatureGate>
 *
 * @example
 * <!-- Con título y descripción personalizados -->
 * <FeatureGate
 *   feature="aiClassification"
 *   title="Clasificación Inteligente con IA"
 *   description="Deja que Grok clasifique tus productos automáticamente"
 * >
 *   <AIClassificationPanel />
 * </FeatureGate>
 *
 * @example
 * <!-- Con UI bloqueada personalizada -->
 * <FeatureGate feature="exportData">
 *   <template #default>
 *     <ExportPanel />
 *   </template>
 *
 *   <template #locked>
 *     <div class="custom-locked-ui">
 *       <p>¡Ups! Necesitas Premium para exportar</p>
 *     </div>
 *   </template>
 * </FeatureGate>
 */

const props = defineProps({
  /**
   * Nombre de la feature requerida para desbloquear el contenido
   * @required
   */
  feature: {
    type: String,
    required: true,
  },

  /**
   * Título mostrado cuando está bloqueado
   */
  title: {
    type: String,
    default: null,
  },

  /**
   * Descripción mostrada cuando está bloqueado
   */
  description: {
    type: String,
    default: null,
  },

  /**
   * Si debe mostrar el botón de upgrade
   */
  showUpgradeButton: {
    type: Boolean,
    default: true,
  },

  /**
   * Tamaño del contenedor bloqueado ('sm' | 'md' | 'lg')
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
});

const emit = defineEmits(["blocked", "upgrade-click"]);

const { hasAccess, showUpgradeModal } = useSubscription();

// Títulos por defecto para features comunes
const defaultTitles = {
  advancedReports: "Reportes Avanzados",
  multiLocation: "Múltiples Ubicaciones",
  apiAccess: "Acceso a API",
  prioritySupport: "Soporte Prioritario",
  customBranding: "Marca Personalizada",
  aiClassification: "Clasificación con IA",
  exportData: "Exportación de Datos",
  maxEmployees: "Más Empleados",
  maxProducts: "Más Productos",
};

// Descripciones por defecto para features comunes
const defaultDescriptions = {
  advancedReports:
    "Accede a análisis detallados, gráficos avanzados y exportación de reportes en múltiples formatos.",
  multiLocation:
    "Gestiona múltiples sucursales o ubicaciones desde una sola cuenta.",
  apiAccess: "Integra con sistemas externos usando nuestra API REST completa.",
  prioritySupport:
    "Obtén respuestas rápidas y atención personalizada de nuestro equipo.",
  customBranding:
    "Personaliza reportes y documentos con tu logo y colores de marca.",
  aiClassification:
    "Usa inteligencia artificial de Grok para clasificar productos automáticamente.",
  exportData:
    "Exporta tus datos a Excel, PDF, CSV y otros formatos para análisis externo.",
  maxEmployees: "Agrega empleados ilimitados a tu negocio sin restricciones.",
  maxProducts: "Registra productos ilimitados en tu inventario sin límites.",
};

const hasAccessToFeature = computed(() => {
  const access = hasAccess(props.feature);

  // Emitir evento si está bloqueado
  if (!access) {
    console.log("🚫 [FeatureGate] Feature bloqueada:", props.feature);
    emit("blocked", props.feature);
  }

  return access;
});

const computedTitle = computed(() => {
  return props.title || defaultTitles[props.feature] || "Función Premium";
});

const computedDescription = computed(() => {
  return (
    props.description ||
    defaultDescriptions[props.feature] ||
    "Esta función solo está disponible en el plan Premium."
  );
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: "p-4 text-sm",
    md: "p-8",
    lg: "p-12 text-lg",
  };
  return sizes[props.size];
});

const handleUpgrade = () => {
  console.log("⬆️ [FeatureGate] Click en upgrade para feature:", props.feature);

  emit("upgrade-click", props.feature);
  showUpgradeModal(props.feature);
};
</script>

<style scoped>
.feature-gate {
  @apply w-full;
}

.feature-unlocked {
  @apply w-full;
}

.feature-locked {
  @apply w-full;
}

/* Animación para el estado bloqueado */
.feature-locked > * {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
