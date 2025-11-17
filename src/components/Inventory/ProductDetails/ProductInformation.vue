<template>
  <!-- 
    ⚠️ DEPRECATED: Este componente mantiene compatibilidad legacy.
    Para nuevas implementaciones, usa ProductEconomicInfo.vue directamente.
    
    Este wrapper delega la renderización al nuevo componente ProductEconomicInfo
    manteniendo la misma interfaz de props para no romper código existente.
  -->
  <ProductEconomicInfo :price="price" :cost="cost" />
</template>

<script setup>
import ProductEconomicInfo from "./ProductEconomicInfo.vue";

// Props (mantenidas para compatibilidad)
const props = defineProps({
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: [Object, Date, String],
    default: null,
  },
  productId: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    default: "MERCH",
    validator: (value) => ["MERCH", "PRODUCT", "SERVICE"].includes(value),
  },
  trackStock: {
    type: Boolean,
    default: false,
  },
  unit: {
    type: String,
    default: "uni",
  },
});
</script>
