<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 pb-32">
    <!-- Header con botones de navegación -->
    <div class="flex items-center justify-between gap-3 mb-6">
      <BackBtn
        :use-back="true"
        tooltip-text="Volver atrás"
        :before-navigate="handleBeforeLeave"
      />
    </div>

    <!-- Título de la sección -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-4"
      >
        <svg
          class="w-8 h-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          ></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        Composición de Materiales
      </h1>
      <p class="text-sm text-gray-500 mb-1">
        {{ productName }}
      </p>
      <p class="text-xs text-gray-400">
        Define qué materiales componen este producto y en qué cantidades
      </p>
    </div>

    <!-- Modo Simple: Input de costo directo (RAW_MATERIAL, MERCH) -->
    <div v-if="isSimpleCostMode" class="space-y-6">
      <div class="bg-white rounded-2xl shadow-lg border-2 p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Costo del Material
        </h3>
        <p class="text-sm text-gray-500 mb-6">
          Ingresa el costo unitario de este material o mercancía
        </p>

        <div class="space-y-4">
          <div>
            <label
              for="simple-cost"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Costo Unitario (S/)
            </label>
            <input
              id="simple-cost"
              v-model="simpleCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg font-semibold"
            />
          </div>

          <div
            v-if="simpleCost !== null && simpleCost !== ''"
            class="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700"
                >Costo configurado:</span
              >
              <span class="text-2xl font-bold text-emerald-600">
                S/ {{ formatNumber(simpleCost) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modo Composición: Sistema completo (PRODUCT, SERVICE) -->
    <div v-if="isCompositionMode">
      <!-- Estado del Costeo - Card expandible -->
      <Transition name="fade-scale">
        <div
          v-if="costingStore.materialsComposition.items.length > 0"
          class="bg-white rounded-2xl shadow-lg border-2 p-6 mb-6"
          :class="{
            'border-red-200 bg-red-50': materialsCostProgress < 30,
            'border-amber-200 bg-amber-50':
              materialsCostProgress >= 30 && materialsCostProgress < 70,
            'border-emerald-200 bg-emerald-50': materialsCostProgress >= 70,
          }"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                Estado del Costeo de Materiales
              </h3>
              <p class="text-sm text-gray-600">
                Materiales configurados: {{ costingStore.materialsWithCost }} de
                {{ costingStore.materialsComposition.items.length }}
                ({{ materialsCostProgress }}%)
              </p>
            </div>
            <button
              @click="showCostingDetails = !showCostingDetails"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5 transition-transform"
                :class="{ 'rotate-180': showCostingDetails }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          <!-- Barra de progreso -->
          <div class="mb-4">
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                :class="{
                  'bg-red-500': materialsCostProgress < 30,
                  'bg-amber-500':
                    materialsCostProgress >= 30 && materialsCostProgress < 70,
                  'bg-emerald-500': materialsCostProgress >= 70,
                }"
                :style="{ width: `${materialsCostProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- Costo calculable -->
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700"
              >Costo calculable:</span
            >
            <span class="text-xl font-bold text-emerald-600">
              S/ {{ formatNumber(costingStore.materialsComposition.totalCost) }}
            </span>
          </div>

          <!-- Detalles expandibles -->
          <Transition name="slide-down">
            <div v-if="showCostingDetails" class="mt-4 pt-4 border-t">
              <div
                v-if="costingStore.materialsWithoutCost.length > 0"
                class="space-y-2"
              >
                <h4 class="text-sm font-medium text-gray-700 mb-2">
                  ⚠️ Materiales sin costo definido:
                </h4>
                <ul class="text-xs space-y-1">
                  <li
                    v-for="material in costingStore.materialsWithoutCost"
                    :key="material.productId"
                    class="text-amber-700"
                  >
                    • {{ material.description }}
                  </li>
                </ul>
              </div>
              <div v-else class="text-sm text-emerald-700">
                ✅ Todos los materiales tienen costo definido
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- Advertencia si hay materiales sin costo -->
      <Transition name="fade-scale">
        <div
          v-if="
            costingStore.materialsWithoutCost.length > 0 &&
            costingStore.materialsComposition.items.length > 0
          "
          class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6"
        >
          <div class="flex gap-3">
            <svg
              class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <div class="text-sm text-amber-800">
              <p class="font-medium">
                {{ costingStore.materialsWithoutCost.length }} material{{
                  costingStore.materialsWithoutCost.length !== 1 ? "es" : ""
                }}
                sin costo definido
              </p>
              <p class="text-amber-700 mt-1">
                Puedes agregar estos materiales igual, pero el costo total será
                parcial hasta que definas sus costos en el inventario.
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Card principal -->
      <div
        class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <!-- Buscador de materiales -->
        <div class="mb-8" v-if="!selectedMaterial">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            <span v-if="costingStore.materialsComposition.items.length === 0"
              >Buscar material</span
            >
            <span v-else>Agregar otro material</span>
          </h2>

          <Suspense>
            <template #default>
              <SearchProductAsync
                mode="materials"
                :exclude-product-id="route.params.productId"
                @material-selected="handleMaterialSelected"
              />
            </template>
            <template #fallback>
              <div class="flex items-center justify-center py-6">
                <div class="text-center">
                  <div
                    class="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"
                  ></div>
                  <p class="text-gray-500 text-sm">Cargando productos...</p>
                </div>
              </div>
            </template>
          </Suspense>
        </div>

        <!-- Card de material seleccionado -->
        <Transition name="slide-fade">
          <div v-if="selectedMaterial" class="mb-8">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">
              Material Seleccionado
            </h2>

            <div
              class="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-2 border-emerald-200 p-6"
            >
              <!-- Badge + nombre + stock -->
              <div class="relative mb-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-800 mb-1">
                      {{ selectedMaterial.description }}
                    </h3>
                    <p
                      v-if="selectedMaterial.stock !== undefined"
                      class="text-sm text-gray-600"
                    >
                      📦 Stock actual: {{ selectedMaterial.stock }}
                      {{ selectedMaterial.unit }}
                    </p>
                  </div>
                  <button
                    @click="handleCancelSelection"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Grid de cantidad y unidad -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- Cantidad -->
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700"
                    >Cantidad</label
                  >
                  <div class="relative">
                    <input
                      ref="quantityInput"
                      v-model="materialQuantity"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      min="0"
                      @keydown.enter="handleAddMaterial"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors"
                    />
                    <div
                      class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500">Máximo 2 decimales</p>
                </div>

                <!-- Unidad (disabled) -->
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700"
                    >Unidad</label
                  >
                  <input
                    :value="selectedMaterial.unit"
                    disabled
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 opacity-75 cursor-not-allowed"
                  />
                  <p class="text-xs text-gray-500">Desde inventario</p>
                </div>
              </div>

              <!-- NUEVO: Factor de Rendimiento (Merma) -->
              <div v-if="showWasteManagement" class="bg-white rounded-xl p-4 mb-4 border border-amber-100 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h4 class="text-sm font-semibold text-gray-800">Merma y Rendimiento</h4>
                    <p class="text-xs text-gray-500">¿Hay pérdida al procesar este material?</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="materialHasWaste" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                
                <Transition name="slide-down">
                  <div v-if="materialHasWaste" class="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Rendimiento (%)</label>
                      <div class="flex items-center gap-2 mt-1">
                        <input
                          v-model.number="materialYieldFactor"
                          type="number"
                          min="1"
                          max="100"
                          class="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                        />
                        <span class="text-sm text-gray-600">% de aprovechamiento</span>
                      </div>
                    </div>
                    
                    <div class="bg-amber-50 rounded-lg p-3 text-sm text-amber-800 border border-amber-100" v-if="materialQuantity && materialQuantity > 0 && materialYieldFactor > 0">
                      <p class="font-medium mb-1">📊 Para obtener {{ materialQuantity }} {{ selectedMaterial.unit }} netos:</p>
                      <ul class="list-disc list-inside space-y-1 text-xs opacity-90 ml-1">
                        <li>Necesitas <strong>{{ (materialQuantity / (materialYieldFactor / 100)).toFixed(2) }} {{ selectedMaterial.unit }} brutos</strong></li>
                        <li v-if="selectedMaterial.cost">Costo bruto: S/ {{ formatNumber(selectedMaterial.cost) }} / {{ selectedMaterial.unit }}</li>
                        <li v-if="selectedMaterial.cost">Costo efectivo: <strong>S/ {{ formatNumber(selectedMaterial.cost / (materialYieldFactor / 100)) }} / {{ selectedMaterial.unit }}</strong></li>
                      </ul>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Información de costo -->
              <div class="bg-white rounded-xl p-4 mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-600">Costo por unidad:</span>
                  <span
                    class="text-lg font-bold"
                    :class="{
                      'text-emerald-600':
                        selectedMaterial.cost && selectedMaterial.cost > 0,
                      'text-gray-400': !selectedMaterial.cost,
                    }"
                  >
                    {{
                      selectedMaterial.cost && selectedMaterial.cost > 0
                        ? `S/ ${formatNumber(selectedMaterial.cost)}`
                        : "S/ --"
                    }}
                  </span>
                </div>
                <div
                  v-if="!selectedMaterial.cost || selectedMaterial.cost <= 0"
                  class="text-xs text-amber-600 font-medium"
                >
                  ⚠️ Este material no tiene costo definido
                </div>
              </div>

              <!-- Subtotal calculado -->
              <div
                v-if="materialQuantity && materialQuantity > 0"
                class="bg-emerald-100 rounded-xl p-4"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700"
                    >Subtotal:</span
                  >
                  <span class="text-2xl font-bold text-emerald-600">
                    {{
                      selectedMaterial.cost && selectedMaterial.cost > 0
                        ? `S/ ${formatNumber(materialQuantity * (selectedMaterial.cost / (materialHasWaste && materialYieldFactor ? (materialYieldFactor / 100) : 1)))}`
                        : "S/ --"
                    }}
                  </span>
                </div>
                <div v-if="materialHasWaste && selectedMaterial.cost > 0" class="text-xs text-emerald-800 text-right opacity-80">
                  (Incluye costo por merma)
                </div>
              </div>

              <!-- Botón agregar -->
              <button
                @click="handleAddMaterial"
                :disabled="!canAddMaterial"
                class="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Agregar Material
              </button>
            </div>
          </div>
        </Transition>

        <!-- Lista de materiales agregados -->
        <div
          v-if="costingStore.materialsComposition.items.length > 0"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">
              Materiales Agregados
            </h3>
            <div class="text-sm text-gray-500">
              {{ costingStore.materialsComposition.items.length }} material{{
                costingStore.materialsComposition.items.length !== 1 ? "es" : ""
              }}
            </div>
          </div>

          <!-- Lista con TransitionGroup -->
          <TransitionGroup name="list" tag="div" class="space-y-3">
            <div
              v-for="item in costingStore.materialsComposition.items"
              :key="item.productId"
              class="bg-gray-50 rounded-xl p-4 border-2 transition-colors"
              :class="{
                'border-emerald-200 bg-emerald-50':
                  item.costPerUnit && item.costPerUnit > 0,
                'border-amber-200 bg-amber-50':
                  !item.costPerUnit || item.costPerUnit <= 0,
              }"
            >
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <!-- Nombre del material -->
                  <div class="font-semibold text-gray-900 truncate mb-1">
                    {{ item.description }}
                    <span
                      v-if="!item.costPerUnit || item.costPerUnit <= 0"
                      class="text-xs text-amber-600 ml-2"
                      >(⚠️ sin costo)</span
                    >
                  </div>

                  <!-- Fila 1: Cantidad editable inline + Unidad -->
                  <div
                    class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 mb-1"
                  >
                    <div class="flex items-center gap-2">
                      <input
                        :value="item.quantity"
                        @input="
                          (e) =>
                            handleUpdateQuantity(item.productId, e.target.value)
                        "
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-20 px-2 py-1 border border-gray-300 rounded text-center font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                      />
                      <span>{{ item.unit }} netos</span>
                      <span class="text-gray-400 mx-1">×</span>
                      <span class="font-medium" :class="{'line-through text-gray-400': item.yieldFactor, 'text-gray-800': !item.yieldFactor}">
                        {{
                          item.costPerUnit && item.costPerUnit > 0
                            ? `S/ ${formatNumber(item.costPerUnit)}`
                            : "S/ --"
                        }}
                      </span>
                    </div>

                    <!-- Fila 2: Rendimiento inline si aplica -->
                    <div v-if="showWasteManagement" class="flex items-center gap-2 ml-0 sm:ml-2">
                      <span class="text-amber-600 font-medium whitespace-nowrap">🔄</span>
                      <input
                        :value="item.yieldFactor || ''"
                        @input="
                          (e) =>
                            handleUpdateYield(item.productId, e.target.value)
                        "
                        type="number"
                        min="1"
                        max="100"
                        placeholder="100"
                        class="w-16 px-1 py-1 border border-amber-300 bg-amber-50 rounded text-center font-medium text-amber-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-200 text-xs"
                      />
                      <span class="text-amber-700 text-xs font-medium">% rto.</span>
                      
                      <span v-if="item.yieldFactor" class="text-xs text-gray-500 ml-1">
                        → S/ {{ formatNumber(item.adjustedCostPerUnit) }} / {{ item.unit }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex items-center text-sm font-medium">
                    <span class="text-gray-400 mr-2">=</span>
                    <span class="font-bold text-emerald-600 text-base">
                      {{
                        item.subtotal && item.subtotal > 0
                          ? `S/ ${formatNumber(item.subtotal)}`
                          : "S/ --"
                      }}
                    </span>
                    <span v-if="item.grossQuantity" class="text-xs text-gray-500 ml-3 font-normal">
                      ({{ item.grossQuantity }} {{ item.unit }} brutos)
                    </span>
                  </div>
                </div>

                <!-- Botón eliminar -->
                <button
                  @click="handleRemoveMaterial(item.productId)"
                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Total -->
            <div
              key="total"
              class="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200"
            >
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-800"
                  >TOTAL MATERIALES</span
                >
                <span class="text-2xl font-bold text-emerald-600">
                  S/
                  {{
                    formatNumber(costingStore.materialsComposition.totalCost)
                  }}
                </span>
              </div>
              <p
                v-if="costingStore.materialsWithoutCost.length > 0"
                class="text-xs text-amber-600 mt-2"
              >
                ⚠️ {{ costingStore.materialsWithoutCost.length }} material{{
                  costingStore.materialsWithoutCost.length !== 1 ? "es" : ""
                }}
                sin costo definido
              </p>
            </div>
          </TransitionGroup>
        </div>

        <!-- Estado vacío -->
        <div
          v-else-if="!selectedMaterial"
          class="text-center py-12 bg-gray-50 rounded-xl"
        >
          <div
            class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              ></path>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-700 mb-1">
            No hay materiales agregados
          </h3>
          <p class="text-sm text-gray-500">
            Busca y agrega los materiales que componen este producto
          </p>
        </div>
      </div>
    </div>
    <!-- Fin modo composición -->



    <!-- Navegación fija (NavigationBtn pattern) -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50"
    >
      <div class="max-w-4xl mx-auto flex gap-3">
        <button
          @click="handleGoBack"
          class="flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          ← Volver
        </button>

        <!-- Botón guardar - Modo Simple -->
        <button
          v-if="isSimpleCostMode"
          @click="handleSaveSimpleCost"
          :disabled="saving || simpleCost === null || simpleCost === ''"
          class="flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          :class="{
            'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg':
              simpleCost !== null && simpleCost !== '' && !saving,
            'bg-gray-200 text-gray-400 cursor-not-allowed':
              saving || simpleCost === null || simpleCost === '',
          }"
        >
          <span v-if="!saving">💾 Guardar Costo</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Guardando...
          </span>
        </button>

        <!-- Botón guardar - Modo Composición -->
        <button
          v-if="isCompositionMode"
          @click="handleSave"
          :disabled="
            saving ||
            costingStore.materialsComposition.items.length === 0 ||
            !costingStore.materialsComposition.hasChanges
          "
          class="flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          :class="{
            'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg':
              costingStore.materialsComposition.items.length > 0 &&
              costingStore.materialsComposition.hasChanges &&
              !saving,
            'bg-gray-200 text-gray-400 cursor-not-allowed':
              saving ||
              costingStore.materialsComposition.items.length === 0 ||
              !costingStore.materialsComposition.hasChanges,
          }"
        >
          <span v-if="!saving">💾 Guardar Composición</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Guardando...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { Timestamp } from "firebase/firestore";
import { useProductCostingStore } from "@/stores/productCostingStore";
import { useInventory } from "@/composables/useInventory";
import { useToast } from "@/composables/useToast";
import { useBusinessStore } from "@/stores/businessStore";
import { getBusinessCapabilities } from "@/utils/businessCapabilities";
import BackBtn from "@/components/ui/BackBtn.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";

// Router
const route = useRoute();
const router = useRouter();

// Composables
const { getProductById, saveProductComposition, validateComposition, updateProduct } =
  useInventory();

// Stores
const costingStore = useProductCostingStore();
const businessStore = useBusinessStore();
const toast = useToast();

// State
const businessCapabilities = ref({});
const materialHasWaste = ref(false);
const materialYieldFactor = ref(100);
const productName = ref("Producto");
const productData = ref(null);
const loading = ref(true);
const saving = ref(false);
const showCostingDetails = ref(false);



// Configuración para CloseBtn
const closeBtnConfig = {
  autoNavigate: true,
  navigationType: "back",
  tooltipText: "Cerrar",
};

// Material selection state
const selectedMaterial = ref(null);
const materialQuantity = ref(null);
const quantityInput = ref(null);

// Simple cost input (for RAW_MATERIAL and MERCH)
const simpleCost = ref(null);

// Computed
const showWasteManagement = computed(() => {
  return businessCapabilities.value.enableWasteManagement === true;
});

const materialsCostProgress = computed(() => {
  return costingStore.materialsCostProgress || 0;
});

const isSimpleCostMode = computed(() => {
  if (!productData.value) return false;
  return ["RAW_MATERIAL", "MERCH"].includes(productData.value.type);
});

const isCompositionMode = computed(() => {
  if (!productData.value) return false;
  return ["PRODUCT", "SERVICE"].includes(productData.value.type);
});

const hasUnsavedChanges = computed(() => {
  // En modo simple: verificar si el costo cambió respecto al original
  if (isSimpleCostMode.value && productData.value) {
    const currentCost = parseFloat(simpleCost.value);
    // Priorizar costStructure.materials sobre product.cost para la comparación
    const originalCost = parseFloat(
      productData.value.costStructure?.materials ?? productData.value.cost ?? 0,
    );
    return currentCost !== originalCost && !isNaN(currentCost);
  }
  // En modo composición: usar el store
  if (isCompositionMode.value) {
    return costingStore.hasUnsavedChanges;
  }
  return false;
});

const canAddMaterial = computed(() => {
  if (!selectedMaterial.value || !materialQuantity.value) return false;
  if (materialQuantity.value <= 0) return false;

  // Validar máximo 2 decimales
  const decimals = (materialQuantity.value.toString().split(".")[1] || "")
    .length;
  if (decimals > 2) return false;

  return true;
});

// Methods
const loadProduct = async () => {
  try {
    loading.value = true;
    const productId = route.params.productId;

    const product = await getProductById(productId);

    if (product) {
      productName.value = product.description;
      productData.value = product;

      // Si es modo simple (RAW_MATERIAL o MERCH), cargar el cost actual
      if (["RAW_MATERIAL", "MERCH"].includes(product.type)) {
        // Priorizar costStructure.materials sobre product.cost
        simpleCost.value =
          product.costStructure?.materials ?? product.cost ?? null;
      }
      // Si es modo composición (PRODUCT o SERVICE), cargar composición si existe
      else if (["PRODUCT", "SERVICE"].includes(product.type)) {
        if (product.composition && product.composition.length > 0) {
          costingStore.loadComposition(product.composition);
        } else {
          costingStore.resetComposition();
        }
      }
    }
  } catch (error) {
    console.error("❌ Error cargando producto:", error);
    toast.error("Error al cargar el producto");
  } finally {
    loading.value = false;
  }
};

const handleMaterialSelected = async (material) => {
  // Verificar si ya existe en la composición
  const exists = costingStore.materialsComposition.items.find(
    (item) => item.productId === material.uuid,
  );

  if (exists) {
    toast.warning(`${material.description} ya está en la composición`);

    // Scroll al item existente con un pequeño delay
    setTimeout(() => {
      const element = document.getElementById(`material-${material.uuid}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight-flash");
        setTimeout(() => element.classList.remove("highlight-flash"), 2000);
      }
    }, 100);

    return;
  }

  // Setear el material seleccionado
  selectedMaterial.value = {
    productId: material.uuid,
    description: material.description,
    unit: material.unit || "uni",
    cost: material.cost || null,
    stock: material.stock || 0,
  };

  if (material.defaultYieldFactor) {
    materialHasWaste.value = true;
    materialYieldFactor.value = material.defaultYieldFactor;
  } else {
    materialHasWaste.value = false;
    materialYieldFactor.value = 100;
  }

  // Focus en el input de cantidad
  await nextTick();
  if (quantityInput.value) {
    quantityInput.value.focus();
  }
};

const handleAddMaterial = () => {
  if (!canAddMaterial.value) return;

  const material = {
    productId: selectedMaterial.value.productId,
    description: selectedMaterial.value.description,
    quantity: parseFloat(materialQuantity.value),
    unit: selectedMaterial.value.unit,
    costPerUnit: selectedMaterial.value.cost,
    yieldFactor: materialHasWaste.value ? materialYieldFactor.value : null,
  };

  const result = costingStore.addMaterialToComposition(material);

  if (result.success) {
    toast.success(`${material.description} agregado`);

    // Resetear selección
    selectedMaterial.value = null;
    materialQuantity.value = null;
  } else if (result.reason === "duplicate") {
    toast.warning("Este material ya está en la composición");
  }
};

const handleCancelSelection = () => {
  selectedMaterial.value = null;
  materialQuantity.value = null;
  materialHasWaste.value = false;
  materialYieldFactor.value = 100;
};

const handleUpdateQuantity = (productId, value) => {
  const quantity = parseFloat(value);

  if (isNaN(quantity) || quantity <= 0) {
    toast.warning("La cantidad debe ser mayor a 0");
    return;
  }

  // Validar máximo 2 decimales
  const decimals = (value.toString().split(".")[1] || "").length;
  if (decimals > 2) {
    toast.warning("La cantidad debe tener máximo 2 decimales");
    return;
  }

  costingStore.updateMaterialQuantity(productId, quantity);
};

const handleUpdateYield = (productId, value) => {
  if (value === "" || value === null || value === undefined) {
    costingStore.updateMaterialYield(productId, null);
    return;
  }

  const yieldValue = parseFloat(value);
  if (isNaN(yieldValue) || yieldValue < 1 || yieldValue > 100) {
    toast.warning("El rendimiento debe estar entre 1 y 100");
    return;
  }

  costingStore.updateMaterialYield(productId, yieldValue);
};

const handleRemoveMaterial = (productId) => {
  const material = costingStore.materialsComposition.items.find(
    (item) => item.productId === productId,
  );

  if (!material) return;

  // Confirmación
  if (confirm(`¿Eliminar ${material.description} de la composición?`)) {
    costingStore.removeMaterial(productId);
    toast.info("Material eliminado");
  }
};

const handleSave = async () => {
  if (costingStore.materialsComposition.items.length === 0) {
    toast.warning("Debes agregar al menos un material");
    return;
  }

  // Validar composición
  const validation = validateComposition(
    costingStore.materialsComposition.items,
  );
  if (!validation.valid) {
    toast.error(`Error de validación: ${validation.errors[0]}`);
    return;
  }

  // Advertencia si hay materiales sin costo
  if (costingStore.hasMaterialsWithoutCost()) {
    const confirmed = confirm(
      `⚠️ Tienes ${costingStore.materialsWithoutCost.length} material${costingStore.materialsWithoutCost.length !== 1 ? "es" : ""} sin costo definido.\n\n` +
        "El costo total será parcial hasta que definas sus costos.\n\n" +
        "¿Continuar guardando?",
    );

    if (!confirmed) return;
  }

  saving.value = true;

  try {
    const productId = route.params.productId;
    const composition = costingStore.materialsComposition.items;
    const totalCost = costingStore.materialsComposition.totalCost;

    await saveProductComposition(productId, composition, totalCost);

    // Marcar como guardado
    costingStore.materialsComposition.hasChanges = false;
    costingStore.materialsComposition.originalData = JSON.parse(
      JSON.stringify(composition),
    );

    toast.success("✅ Composición guardada exitosamente");

    // Redirect después de 2 segundos
    setTimeout(() => {
      router.push({
        name: "InventoryProductCosting",
        params: {
          businessId: route.params.businessId,
          productId: route.params.productId,
        },
      });
    }, 2000);
  } catch (error) {
    console.error("❌ Error guardando composición:", error);
    toast.error("Error al guardar la composición");
  } finally {
    saving.value = false;
  }
};

const handleSaveSimpleCost = async () => {
  if (simpleCost.value === null || simpleCost.value === "") {
    toast.warning("Debes ingresar un costo");
    return;
  }

  if (simpleCost.value < 0) {
    toast.warning("El costo no puede ser negativo");
    return;
  }

  saving.value = true;

  try {
    const productId = route.params.productId;
    const { updateProduct } = useInventory();
    const costValue = parseFloat(simpleCost.value);

    // Crear entrada de historial
    const historyEntry = {
      date: Timestamp.now(),
      value: costValue,
      reason: "Actualización manual de costo",
    };

    // Obtener el costStructure actual o crear uno nuevo
    const currentCostStructure = productData.value.costStructure || {};
    const currentHistory = currentCostStructure.materialsHistory || [];

    const updatePayload = {
      cost: costValue,
      "costStructure.materials": costValue,
      "costStructure.materialsHistory": [...currentHistory, historyEntry],
    };

    console.log("💾 Guardando costo simple:", {
      productId,
      costValue,
      updatePayload,
    });

    // Actualizar tanto cost como costStructure.materials
    await updateProduct(productId, updatePayload);

    // Actualizar el store con el nuevo valor
    costingStore.updateMaterialsCost(costValue);

    toast.success("✅ Costo guardado exitosamente");

    // Redirect después de 2 segundos
    setTimeout(() => {
      router.push({
        name: "InventoryProductCosting",
        params: {
          businessId: route.params.businessId,
          productId: route.params.productId,
        },
      });
    }, 2000);
  } catch (error) {
    console.error("❌ Error guardando costo:", error);
    toast.error("Error al guardar el costo");
  } finally {
    saving.value = false;
  }
};



const handleGoBack = () => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm(
      "¿Seguro que deseas salir sin guardar?\n\nSe perderán los cambios realizados.",
    );

    if (!confirmed) return;
  }

  router.push({
    name: "InventoryProductCosting",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

const handleBeforeLeave = async () => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm(
      "¿Seguro que deseas salir sin guardar?\n\nSe perderán los cambios realizados.",
    );

    return confirmed;
  }

  return true;
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return parseFloat(value).toFixed(2);
};

// Route guard
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm(
      "¿Seguro que deseas salir sin guardar?\n\nSe perderán los cambios realizados.",
    );

    if (confirmed) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// Lifecycle
onMounted(async () => {
  businessCapabilities.value = getBusinessCapabilities(
    businessStore.business?.businessType
  );

  await loadProduct();

  // Inicializar store con el producto ya cargado
  if (route.params.productId && productData.value) {
    costingStore.initializeProduct(route.params.productId, productData.value);
  }
});

onBeforeUnmount(() => {
  // No resetear automáticamente para mantener estado si regresa
});
</script>

<style scoped>
/* Prevent zoom on iOS inputs */
@media screen and (max-width: 480px) {
  input[type="number"],
  input[type="text"],
  select {
    font-size: 16px;
  }
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* ===== TRANSICIONES SUTILES ===== */

/* Fade + Scale (indicador de estado, advertencias) */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Slide + Fade (card de material seleccionado) */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Slide Down (detalles colapsables) */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* TransitionGroup para lista de materiales */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* Asegurar que los elementos que salen no afecten el layout */
.list-leave-active {
  position: absolute;
  width: calc(100% - 2rem);
}

/* Animación para highlight cuando selecciona duplicado */
@keyframes highlight-flash {
  0%,
  100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(234, 179, 8, 0.2);
  }
}

.highlight-flash {
  animation: highlight-flash 1s ease-out 2;
}

/* Hover effects mejorados */
button:not(:disabled) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Focus states mejorados */
input:focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Transición suave para inputs disabled */
input:disabled {
  transition: all 0.3s ease;
}
</style>
