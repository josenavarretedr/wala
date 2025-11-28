<template>
  <div class="client-card" @click="$emit('click', client)">
    <!-- Header con nombre y teléfono -->
    <div class="client-header">
      <div class="client-info">
        <h3 class="client-name">{{ client.name }}</h3>
        <a
          v-if="client.phone"
          :href="whatsappLink"
          @click.stop
          class="client-phone"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
            />
          </svg>
          <span>{{ formatPhone(client.phone) }}</span>
        </a>
        <p v-else class="text-sm text-gray-400">Sin teléfono</p>
        <!-- DNI (nuevo) -->
        <p v-if="client.dni" class="text-xs text-gray-500 mt-1">
          DNI: {{ client.dni }}
        </p>
      </div>

      <!-- Badge de estado -->
      <div class="flex items-center space-x-2">
        <div v-if="client.pendingBalance > 0" class="status-badge badge-debt">
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
          <span>Con deuda</span>
        </div>
        <div v-else class="status-badge badge-ok">
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
        <!-- Acciones rápidas -->
        <div class="flex items-center space-x-1">
          <button
            @click.stop="$emit('edit', client)"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar cliente"
          >
            <IconoirEditPencil class="w-4 h-4" />
          </button>
          <button
            @click.stop="$emit('delete', client)"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar cliente"
          >
            <IconoirTrash class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="client-stats">
      <div class="stat-item">
        <p class="stat-label">Compras</p>
        <p class="stat-value text-blue-600">
          {{ client.transactionCount || 0 }}
        </p>
      </div>
      <div class="stat-item">
        <p class="stat-label">Total Comprado</p>
        <p class="stat-value text-green-600">
          S/ {{ (client.totalPurchases || 0).toFixed(2) }}
        </p>
      </div>
      <div class="stat-item">
        <p class="stat-label">Pendiente</p>
        <p class="stat-value text-red-600">
          S/ {{ (client.pendingBalance || 0).toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="client-footer">
      <p class="last-purchase">
        <svg
          class="w-4 h-4"
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
        <span>
          {{ formatLastPurchase(client.lastPurchase) }}
        </span>
      </p>
      <button class="view-details-btn">
        <span>Ver detalles</span>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  EditPencil as IconoirEditPencil,
  Trash as IconoirTrash,
} from "@iconoir/vue";

const props = defineProps({
  client: {
    type: Object,
    required: true,
  },
});

defineEmits(["click", "edit", "delete"]);

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
.client-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.client-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

/* Header */
.client-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-phone {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #25d366;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.client-phone:hover {
  background: #dcfce7;
  color: #16a34a;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

.badge-debt {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.badge-ok {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

/* Estadísticas */
.client-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 700;
}

/* Footer */
.client-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.last-purchase {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.view-details-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
  background: transparent;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-details-btn:hover {
  background: #3b82f6;
  color: white;
}

/* Responsive */
@media (max-width: 640px) {
  .client-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .stat-value {
    font-size: 0.8rem;
  }

  .client-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .view-details-btn {
    justify-content: center;
  }
}
</style>
