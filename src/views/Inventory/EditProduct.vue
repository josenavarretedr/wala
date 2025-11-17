<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Header con navegación -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="flex items-center gap-3 mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Editar Producto
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ formData.description || "Cargando..." }}
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario de Edición -->
    <div class="max-w-4xl mx-auto">
      <div
        v-if="loading"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
        ></div>
        <p class="text-gray-600 mt-4">Cargando producto...</p>
      </div>

      <form
        v-else
        @submit.prevent="handleSubmit"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6"
      >
        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                ></path>
              </svg>
              Descripción del Producto
            </div>
          </label>
          <input
            v-model="formData.description"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Ej: COCA COLA 500ML"
          />
        </div>

        <!-- Grid: Precio y Costo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Precio de Venta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Precio de Venta
              </div>
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                >S/</span
              >
              <input
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Costo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                Costo (Opcional)
              </div>
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                >S/</span
              >
              <input
                v-model.number="formData.cost"
                type="number"
                step="0.01"
                min="0"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <!-- Margen de Ganancia (Solo lectura) -->
        <div
          v-if="formData.cost && formData.price"
          class="bg-purple-50 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                ></path>
              </svg>
              <span class="text-sm font-medium text-purple-700"
                >Margen de Ganancia</span
              >
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-purple-800">
                {{ calculateMarginPercentage }}%
              </p>
              <p class="text-xs text-purple-600">
                S/ {{ calculateMarginAmount }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tipo de Producto -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                ></path>
              </svg>
              Tipo de Producto
            </div>
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- MERCADERÍA -->
            <button
              type="button"
              @click="formData.type = 'MERCH'"
              :class="[
                'relative p-4 rounded-xl border-2 transition-all text-left',
                formData.type === 'MERCH'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    formData.type === 'MERCH'
                      ? 'bg-emerald-500'
                      : 'bg-gray-100',
                  ]"
                >
                  <svg
                    class="w-5 h-5"
                    :class="
                      formData.type === 'MERCH' ? 'text-white' : 'text-gray-600'
                    "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    ></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h4
                    :class="[
                      'text-sm font-semibold mb-1',
                      formData.type === 'MERCH'
                        ? 'text-emerald-900'
                        : 'text-gray-900',
                    ]"
                  >
                    Mercadería
                  </h4>
                  <p
                    :class="[
                      'text-xs leading-tight',
                      formData.type === 'MERCH'
                        ? 'text-emerald-700'
                        : 'text-gray-500',
                    ]"
                  >
                    Se compra para vender sin transformación
                  </p>
                </div>
              </div>
              <!-- Checkmark -->
              <div
                v-if="formData.type === 'MERCH'"
                class="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </button>

            <!-- PRODUCTO -->
            <button
              type="button"
              @click="formData.type = 'PRODUCT'"
              :class="[
                'relative p-4 rounded-xl border-2 transition-all text-left',
                formData.type === 'PRODUCT'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/30',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    formData.type === 'PRODUCT'
                      ? 'bg-purple-500'
                      : 'bg-gray-100',
                  ]"
                >
                  <svg
                    class="w-5 h-5"
                    :class="
                      formData.type === 'PRODUCT'
                        ? 'text-white'
                        : 'text-gray-600'
                    "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    ></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h4
                    :class="[
                      'text-sm font-semibold mb-1',
                      formData.type === 'PRODUCT'
                        ? 'text-purple-900'
                        : 'text-gray-900',
                    ]"
                  >
                    Producto
                  </h4>
                  <p
                    :class="[
                      'text-xs leading-tight',
                      formData.type === 'PRODUCT'
                        ? 'text-purple-700'
                        : 'text-gray-500',
                    ]"
                  >
                    Se elabora a partir de insumos
                  </p>
                </div>
              </div>
              <!-- Checkmark -->
              <div
                v-if="formData.type === 'PRODUCT'"
                class="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </button>

            <!-- SERVICIO -->
            <button
              type="button"
              @click="formData.type = 'SERVICE'"
              :class="[
                'relative p-4 rounded-xl border-2 transition-all text-left',
                formData.type === 'SERVICE'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    formData.type === 'SERVICE' ? 'bg-blue-500' : 'bg-gray-100',
                  ]"
                >
                  <svg
                    class="w-5 h-5"
                    :class="
                      formData.type === 'SERVICE'
                        ? 'text-white'
                        : 'text-gray-600'
                    "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h4
                    :class="[
                      'text-sm font-semibold mb-1',
                      formData.type === 'SERVICE'
                        ? 'text-blue-900'
                        : 'text-gray-900',
                    ]"
                  >
                    Servicio
                  </h4>
                  <p
                    :class="[
                      'text-xs leading-tight',
                      formData.type === 'SERVICE'
                        ? 'text-blue-700'
                        : 'text-gray-500',
                    ]"
                  >
                    Trabajo o tiempo prestado
                  </p>
                </div>
              </div>
              <!-- Checkmark -->
              <div
                v-if="formData.type === 'SERVICE'"
                class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </button>
          </div>

          <!-- Nota informativa según tipo -->
          <div
            v-if="formData.type"
            class="mt-2 p-3 rounded-lg"
            :class="{
              'bg-emerald-50': formData.type === 'MERCH',
              'bg-purple-50': formData.type === 'PRODUCT',
              'bg-blue-50': formData.type === 'SERVICE',
            }"
          >
            <p
              class="text-xs"
              :class="{
                'text-emerald-700': formData.type === 'MERCH',
                'text-purple-700': formData.type === 'PRODUCT',
                'text-blue-700': formData.type === 'SERVICE',
              }"
            >
              <span v-if="formData.type === 'MERCH'">
                ✓ Controla automáticamente el stock de compra/venta
              </span>
              <span v-else-if="formData.type === 'PRODUCT'">
                ✓ Puede tener receta de producción y controlar stock
              </span>
              <span v-else-if="formData.type === 'SERVICE'">
                ✓ No requiere control de stock físico
              </span>
            </p>
          </div>
        </div>

        <!-- Unidad -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                ></path>
              </svg>
              Unidad de Medida
            </div>
          </label>
          <select
            v-model="formData.unit"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            :disabled="formData.type === 'SERVICE'"
          >
            <option
              v-for="option in availableUnitOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <p
            v-if="formData.type === 'SERVICE'"
            class="text-xs text-gray-500 mt-1"
          >
            Los servicios solo pueden usar la unidad "Servicio"
          </p>
        </div>

        <!-- Control de Stock -->
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    ></path>
                  </svg>
                  Controlar Stock
                </div>
              </label>
              <p class="text-xs text-gray-500">
                <span v-if="formData.type === 'MERCH'">
                  Mercadería siempre controla stock automáticamente
                </span>
                <span v-else-if="formData.type === 'SERVICE'">
                  Servicios normalmente no requieren control de stock
                </span>
                <span v-else>
                  Activa si deseas hacer seguimiento del inventario
                </span>
              </p>
            </div>
            <button
              type="button"
              @click="formData.trackStock = !formData.trackStock"
              :disabled="
                formData.type === 'MERCH' || formData.type === 'SERVICE'
              "
              :class="[
                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                formData.trackStock ? 'bg-teal-600' : 'bg-gray-200',
                formData.type === 'MERCH' || formData.type === 'SERVICE'
                  ? 'opacity-50 cursor-not-allowed'
                  : '',
              ]"
            >
              <span
                :class="[
                  'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                  formData.trackStock ? 'translate-x-7' : 'translate-x-1',
                ]"
              ></span>
            </button>
          </div>

          <!-- Mensaje informativo según estado -->
          <div
            v-if="formData.trackStock"
            class="mt-3 p-3 bg-teal-50 rounded-lg"
          >
            <p class="text-xs text-teal-700">
              ✓ El stock de este producto será monitoreado automáticamente
            </p>
          </div>
          <div v-else class="mt-3 p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-600">
              ✗ Este
              {{ formData.type === "SERVICE" ? "servicio" : "producto" }} no
              tendrá seguimiento de inventario
            </p>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div
          class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200"
        >
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="saving">
              <div
                class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
              ></div>
            </span>
            <span>{{ saving ? "Guardando..." : "Guardar Cambios" }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInventoryStore } from "@/stores/inventoryStore";

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();

const loading = ref(true);
const saving = ref(false);

const formData = ref({
  description: "",
  price: 0,
  cost: null,
  unit: "uni",
  trackStock: false,
  type: "MERCH",
});

// Computed: Opciones de unidad disponibles según el tipo de producto
const availableUnitOptions = computed(() => {
  // Si es SERVICE, solo mostrar la opción "service"
  if (formData.value.type === "SERVICE") {
    return [{ value: "service", label: "Servicio" }];
  }

  // Para MERCH y PRODUCT, mostrar todas las unidades excepto "service"
  return [
    { value: "uni", label: "Unidad (uni)" },
    { value: "kg", label: "Kilogramo" },
    { value: "g", label: "Gramo" },
    { value: "lt", label: "Litro" },
    { value: "ml", label: "Mililitro" },
    { value: "m", label: "Metro" },
    { value: "cm", label: "Centímetro" },
    { value: "porcion", label: "Porción" },
  ];
});

// Computed: Cálculos de margen
const calculateMarginAmount = computed(() => {
  if (!formData.value.price || !formData.value.cost) return "0.00";
  const margin = formData.value.price - formData.value.cost;
  return margin.toFixed(2);
});

const calculateMarginPercentage = computed(() => {
  if (!formData.value.price || !formData.value.cost) return "0.00";
  const margin =
    ((formData.value.price - formData.value.cost) / formData.value.cost) * 100;
  return margin.toFixed(2);
});

// Watch: Ajustar trackStock automáticamente según el tipo
watch(
  () => formData.value.type,
  (newType) => {
    // MERCH siempre controla stock
    if (newType === "MERCH") {
      formData.value.trackStock = true;
      formData.value.unit = "uni";
    }
    // SERVICE no controla stock por defecto
    else if (newType === "SERVICE") {
      formData.value.trackStock = false;
      formData.value.unit = "service";
    } else if (newType === "PRODUCT") {
      formData.value.unit = "uni";
      formData.value.trackStock = false;
    }
  }
);

// Cargar datos del producto
const loadProductData = async () => {
  try {
    loading.value = true;

    const productId = route.params.productId;
    const product = await inventoryStore.getProductDetails(productId);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    // Cargar datos en el formulario
    formData.value = {
      description: product.description || "",
      price: product.price || 0,
      cost: product.cost || null,
      unit: product.unit || "uni",
      trackStock: product.trackStock || false,
      type: product.type || "MERCH",
    };

    console.log("✅ Producto cargado:", formData.value);
  } catch (error) {
    console.error("❌ Error cargando producto:", error);
    alert("Error al cargar el producto");
    goBack();
  } finally {
    loading.value = false;
  }
};

// Guardar cambios
const handleSubmit = async () => {
  try {
    saving.value = true;

    const productId = route.params.productId;

    await inventoryStore.updateProduct(productId, {
      description: formData.value.description,
      price: formData.value.price,
      cost: formData.value.cost,
      unit: formData.value.unit,
      trackStock: formData.value.trackStock,
      type: formData.value.type,
    });

    console.log("✅ Producto actualizado exitosamente");

    // Redirigir de vuelta a los detalles del producto
    router.push({
      name: "InventoryProductDetails",
      params: {
        businessId: route.params.businessId,
        productId: productId,
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    alert("Error al actualizar el producto");
  } finally {
    saving.value = false;
  }
};

// Volver atrás
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadProductData();
});
</script>

<style scoped>
/* Animaciones suaves */
input,
select,
button {
  transition: all 0.2s ease;
}

/* Mejoras de accesibilidad */
button:focus,
input:focus,
select:focus {
  outline: none;
}

/* Estados hover mejorados */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

button:active:not(:disabled) {
  transform: translateY(0);
}
</style>
