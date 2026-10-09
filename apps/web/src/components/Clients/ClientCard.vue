<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200"
  >
    <!-- Header con información principal -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <!-- Lado izquierdo: Nombre del cliente, badge y WhatsApp -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Nombre del cliente -->
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 truncate">
          {{ client.name }}
        </h3>
      </div>

      <!-- Lado derecho: Botón de detalles y expansión -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Botón de detalles -->
        <button
          @click.stop="$emit('click', client)"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
          title="Ver detalles"
        >
          <InfoCircle class="w-4 h-4" />
        </button>

        <!-- Botón de expansión -->
        <button
          @click.stop="toggleOpen"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
          title="Ver estadísticas"
        >
          <ArrowDown
            :class="[
              'w-4 h-4 transform transition-transform duration-300',
              isOpen ? 'rotate-180' : 'rotate-0',
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Badge móvil (visible solo en móvil) -->
    <div class="mb-3 flex items-center gap-2 flex-wrap">
      <div
        v-if="client.pendingBalance > 0"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
      >
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Con Deuda</span>
      </div>
      <div
        v-else
        class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
      >
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Al día</span>
      </div>

      <!-- Link de WhatsApp móvil -->
      <a
        v-if="client.phone"
        :href="whatsappLink"
        @click.stop
        class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-600 border border-green-200 active:bg-green-100 transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
        title="Contactar por WhatsApp"
      >
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
          />
        </svg>
        <span>WhatsApp</span>
      </a>
    </div>

    <!-- Última compra (posición similar a "Fecha" en CardOpening) -->
    <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
      <svg
        class="w-3 h-3 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="truncate">{{
        formatLastPurchase(client.lastPurchase)
      }}</span>
    </div>

    <!-- Contenido expandible (Estadísticas) -->
    <Transition name="fade-scale">
      <div v-if="isOpen" class="pt-2 border-t border-gray-100 space-y-3">
        <!-- Grid de estadísticas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Compras -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <svg
                class="w-3 h-3 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p class="text-xs font-medium text-blue-800">Compras</p>
            </div>
            <p class="text-lg font-bold text-blue-700 tabular-nums">
              {{ client.transactionCount || 0 }}
            </p>
          </div>

          <!-- Total Comprado -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <svg
                class="w-3 h-3 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-xs font-medium text-green-800">Total Comprado</p>
            </div>
            <p class="text-lg font-bold text-green-700 tabular-nums">
              S/ {{ (client.totalPurchases || 0).toFixed(2) }}
            </p>
          </div>

          <!-- Pendiente -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <svg
                class="w-3 h-3 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-xs font-medium text-red-800">Pendiente</p>
            </div>
            <p class="text-lg font-bold text-red-700 tabular-nums">
              S/ {{ (client.pendingBalance || 0).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { InfoCircle, ArrowDown } from "@iconoir/vue";

const props = defineProps({
  client: {
    type: Object,
    required: true,
  },
});

defineEmits(["click", "edit", "delete"]);

const isOpen = ref(false);
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

// Generar link de WhatsApp
const whatsappLink = computed(() => {
  if (!props.client.phone) return null;
  const cleanPhone = props.client.phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Hola ${props.client.name}, te escribo de...`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
});

// Formatear teléfono
function formatPhone(phone) {
  if (!phone) return "";
  // Formato: 999 999 999
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 9) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return phone;
}

// Formatear última compra
function formatLastPurchase(timestamp) {
  if (!timestamp) return "Sin compras";

  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Última compra: Hoy";
  if (diffDays === 1) return "Última compra: Ayer";
  if (diffDays < 7) return `Última compra: Hace ${diffDays} días`;
  if (diffDays < 30)
    return `Última compra: Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365)
    return `Última compra: Hace ${Math.floor(diffDays / 30)} meses`;

  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>

<style scoped>
/* Animación de expansión */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects para touch devices */
@media (hover: hover) {
  .hover\:shadow-md:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments mejorados */
@media (max-width: 640px) {
  /* Asegurar que los badges no se compriman demasiado */
  .inline-flex.gap-1 {
    min-width: fit-content;
  }

  /* Mejor espaciado en móvil */
  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
}

/* Asegurar que las cifras no se deformen */
@media (max-width: 480px) {
  .tabular-nums {
    font-size: 0.9rem;
    line-height: 1.25rem;
  }
}
</style>
