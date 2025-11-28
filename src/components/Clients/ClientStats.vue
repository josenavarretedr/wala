<template>
  <div class="client-stats-wrapper">
    <div class="stats-cards">
      <!-- Total Comprado -->
      <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
        <div class="stat-icon-container">
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Comprado</p>
          <p class="stat-value">
            S/ {{ financialStats.totalPurchases.toFixed(2) }}
          </p>
          <p class="stat-description">
            {{ financialStats.transactionCount }} transacciones
          </p>
        </div>
      </div>

      <!-- Total Pagado -->
      <div class="stat-card bg-gradient-to-br from-green-500 to-green-600">
        <div class="stat-icon-container">
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Pagado</p>
          <p class="stat-value">S/ {{ financialStats.totalPaid.toFixed(2) }}</p>
          <p class="stat-description">{{ paymentPercentage }}% del total</p>
        </div>
      </div>

      <!-- Saldo Pendiente -->
      <div class="stat-card bg-gradient-to-br from-red-500 to-red-600">
        <div class="stat-icon-container">
          <svg
            class="w-8 h-8 text-white"
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
        </div>
        <div class="stat-content">
          <p class="stat-label">Saldo Pendiente</p>
          <p class="stat-value">
            S/ {{ financialStats.pendingBalance.toFixed(2) }}
          </p>
          <p class="stat-description">{{ debtPercentage }}% pendiente</p>
        </div>
      </div>
    </div>

    <!-- Barra de progreso de pagos -->
    <div class="progress-section">
      <div class="progress-header">
        <h3 class="progress-title">Estado de Pagos</h3>
        <span class="progress-percentage">{{ paymentPercentage }}% pagado</span>
      </div>
      <div class="progress-bar-container">
        <div
          class="progress-bar-fill"
          :style="{ width: `${paymentPercentage}%` }"
        ></div>
      </div>
      <div class="progress-labels">
        <span class="progress-label-left">S/ 0</span>
        <span class="progress-label-right"
          >S/ {{ financialStats.totalPurchases.toFixed(2) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  financialStats: {
    type: Object,
    required: true,
    default: () => ({
      totalPurchases: 0,
      totalPaid: 0,
      pendingBalance: 0,
      transactionCount: 0,
    }),
  },
});

const paymentPercentage = computed(() => {
  if (props.financialStats.totalPurchases === 0) return 0;
  return Math.round(
    (props.financialStats.totalPaid / props.financialStats.totalPurchases) * 100
  );
});

const debtPercentage = computed(() => {
  if (props.financialStats.totalPurchases === 0) return 0;
  return Math.round(
    (props.financialStats.pendingBalance /
      props.financialStats.totalPurchases) *
      100
  );
});
</script>

<style scoped>
.client-stats-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Progress Section */
.progress-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
}

.progress-bar-container {
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 0.5rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 12px;
  transition: width 0.8s ease;
  position: relative;
}

.progress-bar-fill::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon-container {
    width: 56px;
    height: 56px;
  }
}
</style>
