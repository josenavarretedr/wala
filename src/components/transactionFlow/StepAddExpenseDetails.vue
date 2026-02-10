<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Detalles del Gasto
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        {{
          transactionStore.transactionToAdd.value.category === "materials"
            ? "Registra los materiales o insumos comprados"
            : "Describe qué necesitó el negocio y cuánto costó"
        }}
      </p>
    </div>

    <!-- ========================================== -->
    <!-- FLUJO PARA MATERIALS (Compra de Materiales) -->
    <!-- ========================================== -->
    <div
      v-if="transactionStore.transactionToAdd.value.category === 'materials'"
      class="space-y-6"
    >
      <!-- Buscador de materiales/productos -->
      <div
        class="space-y-4"
        v-if="!transactionStore.itemToAddInExpenseMaterial.value.description"
      >
        <h2 class="text-lg font-semibold text-gray-800">
          Buscar
          <span
            v-if="
              !transactionStore.transactionToAdd.value.materialItems ||
              transactionStore.transactionToAdd.value.materialItems.length === 0
            "
            >material o insumo</span
          >
          <span v-else>otros materiales</span>
        </h2>
        <Suspense>
          <template #default>
            <SearchProductForExpenseAsync />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center py-6">
              <div class="text-center">
                <div
                  class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"
                ></div>
                <p class="text-sm text-gray-500 mt-2">Cargando productos...</p>
              </div>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- Material seleccionado -->
      <div
        class="space-y-3"
        v-if="transactionStore.itemToAddInExpenseMaterial.value.description"
      >
        <label class="text-lg font-semibold text-gray-800"
          >Material Seleccionado</label
        >
        <div class="relative">
          <!-- Badge de estado -->
          <Transition name="badge">
            <div
              v-if="
                transactionStore.itemToAddInExpenseMaterial.value
                  .oldOrNewProduct
              "
              class="absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm z-10"
              :class="{
                'bg-blue-50 text-blue-700 border border-blue-200':
                  transactionStore.itemToAddInExpenseMaterial.value
                    .oldOrNewProduct === 'old',
                'bg-green-50 text-green-700 border border-green-200':
                  transactionStore.itemToAddInExpenseMaterial.value
                    .oldOrNewProduct === 'new',
              }"
            >
              {{
                transactionStore.itemToAddInExpenseMaterial.value
                  .oldOrNewProduct === "old"
                  ? "Existente"
                  : "Nuevo"
              }}
            </div>
          </Transition>

          <input
            v-model="
              transactionStore.itemToAddInExpenseMaterial.value.description
            "
            type="text"
            disabled
            placeholder="Selecciona un material arriba"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 transition-all duration-200"
          />

          <Transition name="fade-scale">
            <button
              v-if="
                transactionStore.itemToAddInExpenseMaterial.value.description
              "
              @click="handleResetMaterial"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
            >
              <Xmark class="w-4 h-4" />
            </button>
          </Transition>
        </div>
      </div>

      <!-- Formulario: Cantidad, Unidad y Costo -->
      <Transition name="slide-fade">
        <div
          v-if="transactionStore.itemToAddInExpenseMaterial.value.description"
        >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Cantidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Cantidad</label>
              <div class="relative">
                <input
                  ref="quantityInputMaterial"
                  v-model="
                    transactionStore.itemToAddInExpenseMaterial.value.quantity
                  "
                  type="number"
                  placeholder="0"
                  min="0"
                  @keydown.enter="focusCostInput"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-orange-500 focus:outline-none transition-colors"
                />
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                ></div>
              </div>
              <p class="text-xs text-gray-500">Ingresa la cantidad comprada</p>
            </div>

            <!-- Unidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Unidad</label>
              <select
                v-model="transactionStore.itemToAddInExpenseMaterial.value.unit"
                :disabled="
                  transactionStore.itemToAddInExpenseMaterial.value
                    .oldOrNewProduct === 'old'
                "
                class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-gray-50"
              >
                <option value="uni">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="lt">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="m">Metro</option>
                <option value="cm">Porción</option>
                <option value="service">Servicio</option>
              </select>
            </div>

            <!-- Costo por unidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700"
                >Costo (S/)</label
              >
              <div class="relative">
                <input
                  ref="costInputMaterial"
                  v-model="
                    transactionStore.itemToAddInExpenseMaterial.value.cost
                  "
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  @keydown.enter="handleAddMaterialOnEnter"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-orange-500 focus:outline-none transition-colors"
                />
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                ></div>
              </div>
              <p class="text-xs text-gray-500">Costo por unidad</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Botón Agregar Material -->
      <button
        @click="handleAddMaterial"
        :disabled="!canAddMaterial"
        class="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <KeyframePlus class="w-5 h-5" />
        Agregar Material
      </button>

      <!-- Indicador de saldo disponible -->
      <div
        v-if="transactionStore.itemToAddInExpenseMaterial.value.description"
        class="p-4 rounded-xl border"
        :class="{
          'bg-green-50 border-green-200': !wouldExceedBalance,
          'bg-red-50 border-red-200': wouldExceedBalance,
        }"
      >
        <div class="flex items-start gap-3">
          <!-- Icono -->
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            :class="{
              'bg-green-100': !wouldExceedBalance,
              'bg-red-100': wouldExceedBalance,
            }"
          >
            <span
              class="text-xl"
              :class="{
                'text-green-600': !wouldExceedBalance,
                'text-red-600': wouldExceedBalance,
              }"
            >
              {{ wouldExceedBalance ? "⚠️" : "💰" }}
            </span>
          </div>

          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-semibold mb-1"
              :class="{
                'text-green-800': !wouldExceedBalance,
                'text-red-800': wouldExceedBalance,
              }"
            >
              {{
                wouldExceedBalance ? "Saldo insuficiente" : "Saldo disponible"
              }}
            </p>

            <div class="space-y-1">
              <!-- Saldo actual -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600"
                  >Saldo en {{ selectedAccountLabel }}:</span
                >
                <span class="font-semibold text-gray-900">
                  S/ {{ maxAmount.toFixed(2) }}
                </span>
              </div>

              <!-- Total ya agregado -->
              <div
                v-if="getMaterialsTotal() > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Total agregado:</span>
                <span class="font-semibold text-gray-900">
                  S/ {{ getMaterialsTotal().toFixed(2) }}
                </span>
              </div>

              <!-- Costo del item actual -->
              <div
                v-if="getCurrentItemTotal() > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Este material:</span>
                <span class="font-semibold text-orange-600">
                  S/ {{ getCurrentItemTotal().toFixed(2) }}
                </span>
              </div>

              <!-- Divider -->
              <div
                v-if="getMaterialsTotal() > 0 || getCurrentItemTotal() > 0"
                class="border-t border-gray-200 pt-1 mt-1"
              ></div>

              <!-- Total general -->
              <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-gray-700">Total después:</span>
                <span
                  class="font-bold text-base"
                  :class="{
                    'text-green-600': !wouldExceedBalance,
                    'text-red-600': wouldExceedBalance,
                  }"
                >
                  S/
                  {{ (getMaterialsTotal() + getCurrentItemTotal()).toFixed(2) }}
                </span>
              </div>

              <!-- Saldo restante -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Saldo restante:</span>
                <span
                  class="font-semibold"
                  :class="{
                    'text-green-600': !wouldExceedBalance,
                    'text-red-600': wouldExceedBalance,
                  }"
                >
                  S/
                  {{
                    Math.max(
                      0,
                      maxAmount - getMaterialsTotal() - getCurrentItemTotal(),
                    ).toFixed(2)
                  }}
                </span>
              </div>
            </div>

            <!-- Mensaje de advertencia -->
            <p
              v-if="wouldExceedBalance"
              class="mt-2 text-xs text-red-700 font-medium"
            >
              ⚠️ No tienes saldo suficiente para esta compra. Solo puedes
              agregar hasta S/
              {{ Math.max(0, maxAmount - getMaterialsTotal()).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Lista de materiales agregados -->
      <div
        class="space-y-4"
        v-if="
          transactionStore.transactionToAdd.value.materialItems &&
          transactionStore.transactionToAdd.value.materialItems.length > 0
        "
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            Materiales Agregados
          </h3>
          <Transition name="fade-scale">
            <div
              v-if="
                transactionStore.transactionToAdd.value.materialItems &&
                transactionStore.transactionToAdd.value.materialItems.length > 0
              "
              class="text-sm text-gray-500"
            >
              {{ transactionStore.transactionToAdd.value.materialItems.length }}
              material{{
                transactionStore.transactionToAdd.value.materialItems.length > 1
                  ? "es"
                  : ""
              }}
            </div>
          </Transition>
        </div>

        <!-- Lista de items -->
        <TransitionGroup name="list" tag="div" class="space-y-3">
          <template
            v-if="
              transactionStore.transactionToAdd.value.materialItems &&
              transactionStore.transactionToAdd.value.materialItems.length > 0
            "
          >
            <div
              v-for="material in transactionStore.transactionToAdd.value
                .materialItems"
              :key="material.uuid"
              class="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-300 transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-semibold text-gray-900 truncate">
                      {{ material.description }}
                    </h4>
                    <span
                      v-if="material.oldOrNewProduct === 'new'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0"
                    >
                      Nuevo
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span
                      >{{ material.quantity }}
                      {{ material.unit || "uni" }}</span
                    >
                    <span>•</span>
                    <span
                      >S/ {{ material.cost?.toFixed(2) || "0.00" }}/uni</span
                    >
                    <span>•</span>
                    <span class="font-semibold text-gray-900"
                      >Total: S/
                      {{
                        (
                          (material.cost || 0) * (material.quantity || 0)
                        ).toFixed(2)
                      }}</span
                    >
                  </div>
                </div>
                <button
                  @click="
                    transactionStore.removeMaterialItemFromExpense(
                      material.uuid,
                    )
                  "
                  class="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Xmark class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Total -->
            <div
              key="total-materials"
              class="bg-orange-50 rounded-xl p-4 border border-orange-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Package class="w-5 h-5 text-orange-600" />
                  <span class="font-semibold text-gray-800">
                    Total de Compra
                  </span>
                </div>
                <span class="text-xl font-bold text-orange-600">
                  S/ {{ getMaterialsTotal().toFixed(2) }}
                </span>
              </div>
              <p class="text-xs text-gray-600 mt-2">
                Saldo disponible: S/ {{ maxAmount.toFixed(2) }}
              </p>
            </div>
          </template>

          <!-- Estado vacío -->
          <div v-else key="empty-state" class="text-center py-8">
            <div
              class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <Package class="w-6 h-6 text-gray-400" />
            </div>
            <h3 class="font-semibold text-gray-600 mb-1">
              No hay materiales agregados
            </h3>
            <p class="text-sm text-gray-500">
              Busca y agrega materiales para registrar la compra
            </p>
          </div>
        </TransitionGroup>
      </div>

      <!-- Campo de notas para materials -->
      <div
        class="space-y-3"
        v-if="
          transactionStore.transactionToAdd.value.materialItems &&
          transactionStore.transactionToAdd.value.materialItems.length > 0
        "
      >
        <label class="text-lg font-semibold text-gray-800"
          >Notas (opcional)</label
        >
        <textarea
          v-model="transactionStore.transactionToAdd.value.notes"
          placeholder="Agregar observaciones sobre esta compra de materiales..."
          rows="3"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
        ></textarea>
        <p class="text-xs text-gray-500">
          Puedes agregar detalles adicionales sobre esta compra
        </p>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- FLUJO PARA LABOR/OVERHEAD (Gastos Simples) -->
    <!-- ========================================== -->
    <div v-else class="space-y-6">
      <!-- Campo de búsqueda de gasto -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800">
          Descripción del Gasto
        </label>

        <!-- Componente de búsqueda asíncrona -->
        <SearchExpenseAsync
          :category="transactionStore.transactionToAdd.value.category"
          @update:expenseToAdd="handleExpenseSelected"
        />

        <!-- Mostrar gasto seleccionado -->
        <div
          v-if="description"
          class="p-4 bg-gray-50 border border-gray-200 rounded-xl"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-semibold text-gray-900 truncate">
                  {{ description }}
                </span>
                <span
                  v-if="expenseType === 'new'"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Nuevo
                </span>
                <span
                  v-else-if="selectedExpenseMetadata"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                >
                  Recurrente
                </span>
              </div>
            </div>

            <!-- Botón para limpiar selección -->
            <button
              @click="clearExpenseSelection"
              class="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title="Cambiar gasto"
            >
              <Xmark class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-500">
          Busca gastos anteriores o registra uno nuevo
        </p>
      </div>

      <!-- Campo de costo -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800">Monto (S/)</label>
        <div class="relative">
          <input
            v-model.number="amount"
            @keyup.enter="addExpenseHandler"
            type="number"
            step="0.01"
            :max="maxAmount"
            placeholder="0.00"
            class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-center font-medium text-gray-700 focus:border-red-500 focus:outline-none transition-colors"
          />
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"
          ></div>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs text-gray-500">Ingresa el monto total del gasto</p>
          <p v-if="maxAmount > 0" class="text-xs text-blue-600 font-medium">
            Saldo disponible en {{ selectedAccountLabel }}: S/
            {{ maxAmount.toFixed(2) }}
          </p>
          <p
            v-else-if="transactionStore.transactionToAdd.value.account"
            class="text-xs text-amber-600 font-medium"
          >
            ⚠️ No hay saldo suficiente en {{ selectedAccountLabel }}
          </p>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- CLASIFICACIÓN PAYLABOR (Solo labor + new)  -->
      <!-- ========================================== -->
      <Transition name="slide-fade">
        <div
          v-if="
            transactionStore.transactionToAdd.value.category === 'labor' &&
            expenseType === 'new' &&
            amount > 0
          "
          class="space-y-4"
        >
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-gray-800">
              Este pago corresponde principalmente a...
            </h3>
            <p class="text-xs text-gray-500">
              Selecciona el rol principal del trabajador
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <!-- DIRECT_SERVICE -->
            <button
              v-if="visiblePayLaborRoles.DIRECT_SERVICE"
              type="button"
              @click="selectPayLaborRole('DIRECT_SERVICE')"
              :class="[
                'w-full p-4 rounded-xl transition-all duration-200 flex flex-row items-start gap-3 border text-left',
                selectedPayLabor === 'DIRECT_SERVICE'
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                  : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-gray-200 hover:border-indigo-200',
              ]"
            >
              <div
                class="p-2 rounded-full shrink-0 mt-0.5"
                :class="
                  selectedPayLabor === 'DIRECT_SERVICE'
                    ? 'bg-white/20'
                    : 'bg-indigo-50'
                "
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block"
                  >Atención directa / servicio profesional</span
                >
                <span class="text-xs opacity-80 block mt-0.5"
                  >El tiempo del trabajador se vende (psicólogo, estilista,
                  consultor)</span
                >
              </div>
            </button>

            <!-- PRODUCTION_SUPPORT -->
            <button
              v-if="visiblePayLaborRoles.PRODUCTION_SUPPORT"
              type="button"
              @click="selectPayLaborRole('PRODUCTION_SUPPORT')"
              :class="[
                'w-full p-4 rounded-xl transition-all duration-200 flex flex-row items-start gap-3 border text-left',
                selectedPayLabor === 'PRODUCTION_SUPPORT'
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/25'
                  : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 border-gray-200 hover:border-teal-200',
              ]"
            >
              <div
                class="p-2 rounded-full shrink-0 mt-0.5"
                :class="
                  selectedPayLabor === 'PRODUCTION_SUPPORT'
                    ? 'bg-white/20'
                    : 'bg-teal-50'
                "
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block"
                  >Producción general (cocina, taller, fábrica)</span
                >
                <span class="text-xs opacity-80 block mt-0.5"
                  >El trabajador habilita producción (cocinero, operador de
                  máquina)</span
                >
              </div>
            </button>

            <!-- ADMIN_SUPPORT -->
            <button
              v-if="visiblePayLaborRoles.ADMIN_SUPPORT"
              type="button"
              @click="selectPayLaborRole('ADMIN_SUPPORT')"
              :class="[
                'w-full p-4 rounded-xl transition-all duration-200 flex flex-row items-start gap-3 border text-left',
                selectedPayLabor === 'ADMIN_SUPPORT'
                  ? 'bg-gray-600 text-white border-gray-600 shadow-md shadow-gray-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 border-gray-200 hover:border-gray-300',
              ]"
            >
              <div
                class="p-2 rounded-full shrink-0 mt-0.5"
                :class="
                  selectedPayLabor === 'ADMIN_SUPPORT'
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                "
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block"
                  >Administración / apoyo</span
                >
                <span class="text-xs opacity-80 block mt-0.5"
                  >No produce ni atiende directamente (caja, ventas,
                  limpieza)</span
                >
              </div>
            </button>
          </div>
        </div>
      </Transition>

      <!-- ========================================== -->
      <!-- CLASIFICACIÓN OVERHEAD (Solo overhead)     -->
      <!-- ========================================== -->
      <Transition name="slide-fade">
        <div
          v-if="
            transactionStore.transactionToAdd.value.category === 'overhead' &&
            expenseType === 'new' &&
            amount > 0
          "
          class="space-y-4"
        >
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-gray-800">
              ¿Dónde impacta más este gasto?
            </h3>
            <p class="text-xs text-gray-500">
              Esto ayuda a clasificar correctamente tus costos
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <!-- PRODUCE -->
            <button
              type="button"
              v-if="!isCommerceBusiness"
              @click="selectOverheadUsage('PRODUCE')"
              :class="[
                'w-full p-4 rounded-xl transition-all duration-200 flex flex-row items-start gap-3 border text-left',
                selectedOverheadUsage === 'PRODUCE'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25'
                  : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-gray-200 hover:border-orange-200',
              ]"
            >
              <div
                class="p-2 rounded-full shrink-0 mt-0.5"
                :class="
                  selectedOverheadUsage === 'PRODUCE'
                    ? 'bg-white/20'
                    : 'bg-orange-50'
                "
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block"
                  >En la producción o prestación de servicio</span
                >
                <span class="text-xs opacity-80 block mt-0.5"
                  >Cocina, taller, máquinas, energía productiva</span
                >
              </div>
            </button>

            <!-- ADMIN -->
            <button
              type="button"
              @click="selectOverheadUsage('ADMIN')"
              :class="[
                'w-full p-4 rounded-xl transition-all duration-200 flex flex-row items-start gap-3 border text-left',
                selectedOverheadUsage === 'ADMIN'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200',
              ]"
            >
              <div
                class="p-2 rounded-full shrink-0 mt-0.5"
                :class="
                  selectedOverheadUsage === 'ADMIN'
                    ? 'bg-white/20'
                    : 'bg-blue-50'
                "
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block"
                  >En la atención o gestión</span
                >
                <span class="text-xs opacity-80 block mt-0.5"
                  >Caja, agenda, ventas, oficina</span
                >
              </div>
            </button>

            <!-- MIXED -->
            <button
              type="button"
              @click="selectOverheadUsage('MIXED')"
              :class="[
                'w-full p-4 rounded-xl transition-all duration-200 flex flex-row items-start gap-3 border text-left',
                selectedOverheadUsage === 'MIXED'
                  ? 'bg-gray-600 text-white border-gray-600 shadow-md shadow-gray-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 border-gray-200 hover:border-gray-300',
              ]"
            >
              <div
                class="p-2 rounded-full shrink-0 mt-0.5"
                :class="
                  selectedOverheadUsage === 'MIXED'
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                "
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block"
                  >En todo el negocio</span
                >
                <span class="text-xs opacity-80 block mt-0.5"
                  >Apoya ambas áreas (alquiler, servicios generales)</span
                >
              </div>
            </button>
          </div>

          <!-- ========================================== -->
          <!-- SPLIT DE PRORRATEO (Solo overhead MIXED)   -->
          <!-- ========================================== -->
          <Transition name="slide-fade">
            <div
              v-if="selectedOverheadUsage === 'MIXED' && amount > 0"
              class="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <div class="space-y-1">
                <h4 class="text-sm font-semibold text-gray-800">
                  Prorratear el gasto
                </h4>
                <p class="text-xs text-gray-500">
                  Ajusta cómo se distribuye S/
                  {{ amount?.toFixed(2) || "0.00" }} entre producción y gestión
                </p>
              </div>

              <!-- Slider visual -->
              <div class="space-y-3">
                <!-- Labels de porcentaje -->
                <div class="flex justify-between text-xs font-medium">
                  <span class="text-orange-600"
                    >Producción {{ Math.round(producePercentage * 100) }}%</span
                  >
                  <span class="text-blue-600"
                    >Gestión {{ Math.round(adminPercentage * 100) }}%</span
                  >
                </div>

                <!-- Slider -->
                <div class="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    :value="Math.round(producePercentage * 100)"
                    @input="handleSliderChange($event.target.value)"
                    class="w-full h-2 bg-gradient-to-r from-orange-400 to-blue-400 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                </div>

                <!-- Inputs de montos -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- Producción -->
                  <div class="space-y-1">
                    <label class="text-xs font-medium text-orange-700"
                      >Producción (S/)</label
                    >
                    <input
                      :value="produceAmount.toFixed(2)"
                      @change="handleProduceAmountChange($event.target.value)"
                      type="number"
                      step="0.01"
                      min="0"
                      :max="amount"
                      class="w-full px-3 py-2 border border-orange-200 rounded-lg text-center text-sm font-medium text-gray-700 focus:border-orange-500 focus:outline-none transition-colors bg-white"
                    />
                  </div>
                  <!-- Gestión -->
                  <div class="space-y-1">
                    <label class="text-xs font-medium text-blue-700"
                      >Gestión (S/)</label
                    >
                    <input
                      :value="adminAmount.toFixed(2)"
                      @change="handleAdminAmountChange($event.target.value)"
                      type="number"
                      step="0.01"
                      min="0"
                      :max="amount"
                      class="w-full px-3 py-2 border border-blue-200 rounded-lg text-center text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none transition-colors bg-white"
                    />
                  </div>
                </div>

                <!-- Barra visual de distribución -->
                <div class="flex h-3 rounded-full overflow-hidden">
                  <div
                    class="bg-orange-400 transition-all duration-300"
                    :style="{
                      width: `${Math.round(producePercentage * 100)}%`,
                    }"
                  ></div>
                  <div
                    class="bg-blue-400 transition-all duration-300"
                    :style="{ width: `${Math.round(adminPercentage * 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- Campo de notas -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800"
          >Notas (opcional)</label
        >
        <textarea
          v-model="transactionStore.transactionToAdd.value.notes"
          placeholder="Agregar observaciones sobre este gasto..."
          rows="3"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors resize-none"
        ></textarea>
        <p class="text-xs text-gray-500">
          Puedes agregar detalles adicionales sobre este gasto
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useExpensesStore } from "@/stores/expensesStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useBusinessStore } from "@/stores/businessStore";
import { Package, Xmark, KeyframePlus } from "@iconoir/vue";
import { ref, computed, watch, onMounted } from "vue";
import SearchExpenseAsync from "./SearchExpenseAsync.vue";
import SearchProductForExpenseAsync from "./SearchProductForExpenseAsync.vue";
import {
  getVisiblePayLaborRoles,
  classifyPayroll,
  classifyMaterials,
  classifyOperations,
  suggestSplit,
  Bucket,
} from "@/utils/expenseBucketClassifier";

// Computed
const isCommerceBusiness = computed(() => {
  return businessStore.business?.businessType === "RETAIL";
});

// ========================================
// ESTADO LOCAL
// ========================================

// Para labor/overhead (gastos simples)
const description = ref("");
const amount = ref(null);
const selectedCategory = ref(null);
const expenseType = ref(null); // 'new' o 'old'
const selectedExpenseId = ref(null);
const selectedExpenseMetadata = ref(null);

// Para clasificación PAYLABOR
const selectedPayLabor = ref(null); // 'DIRECT_SERVICE' | 'PRODUCTION_SUPPORT' | 'ADMIN_SUPPORT'

// Para clasificación OVERHEAD
const selectedOverheadUsage = ref(null); // 'PRODUCE' | 'ADMIN' | 'MIXED'
const producePercentage = ref(0);
const adminPercentage = ref(0);
const produceAmount = ref(0);
const adminAmount = ref(0);

// Referencias para inputs de materials
const quantityInputMaterial = ref(null);
const costInputMaterial = ref(null);

// ========================================
// STORES
// ========================================
const expensesStore = useExpensesStore();
const transactionStore = useTransactionStore();
const flow = useTransactionFlowStore();
const accountsBalanceStore = useAccountsBalanceStore();
const businessStore = useBusinessStore();

// ========================================
// SALDOS ACTUALES DESDE ACCOUNTSBALANCESTORE
// ========================================

// Obtener saldos actuales directamente del store (que usa dailySummary)
const saldoActualCash = computed(() => accountsBalanceStore.saldoActualCash);
const saldoActualBank = computed(() => accountsBalanceStore.saldoActualBank);

// 🔄 Watch para detectar cambios en transacciones y recargar automáticamente
watch(
  () => accountsBalanceStore.transactions,
  async (newTransactions) => {
    if (newTransactions && newTransactions.length > 0) {
      console.log(
        "🔄 StepAddExpenseDetails - Detectados cambios en transacciones, recargando saldos...",
      );
      // Recargar dailySummary para obtener saldos actualizados
      await accountsBalanceStore.loadFromDailySummary();
    }
  },
  { deep: true },
);

// ========================================
// HANDLERS PARA LABOR/OVERHEAD
// ========================================

// Handler para cuando se selecciona un gasto
const handleExpenseSelected = (expenseData) => {
  description.value = expenseData.description;
  expenseType.value = expenseData.oldOrNewExpense;
  selectedExpenseId.value = expenseData.selectedExpenseId;

  console.log("🔍 DEBUG - Expense Selected:", {
    description: expenseData.description,
    oldOrNewExpense: expenseData.oldOrNewExpense,
    category: expenseData.category,
    expenseId: expenseData.selectedExpenseId,
  });

  if (expenseData.oldOrNewExpense === "old") {
    // Gasto existente
    selectedCategory.value = expenseData.category;
    selectedExpenseMetadata.value = expenseData.metadata;
  } else {
    // Gasto nuevo: resetear solo metadata, mantener categoría del paso anterior
    selectedExpenseMetadata.value = null;
    // La categoría se mantiene de StepExpenseType (no resetear)
  }

  // Actualizar stores
  transactionStore.setExpenseDescription(expenseData.description);
  transactionStore.transactionToAdd.value.expenseId =
    expenseData.selectedExpenseId;
  transactionStore.transactionToAdd.value.oldOrNewExpense =
    expenseData.oldOrNewExpense;

  if (expenseData.category) {
    transactionStore.setExpenseCategory(expenseData.category);
  }

  console.log("✅ DEBUG - After Selection:", {
    description: description.value,
    expenseType: expenseType.value,
    selectedCategory: selectedCategory.value,
    storeCategory: transactionStore.transactionToAdd.value.category,
    amount: amount.value,
  });
};

// Función para limpiar la selección
const clearExpenseSelection = () => {
  description.value = "";
  amount.value = null;
  // NO resetear selectedCategory - viene del paso anterior (StepExpenseType)
  expenseType.value = null;
  selectedExpenseId.value = null;
  selectedExpenseMetadata.value = null;

  // Reset clasificación
  selectedPayLabor.value = null;
  selectedOverheadUsage.value = null;
  producePercentage.value = 0;
  adminPercentage.value = 0;
  produceAmount.value = 0;
  adminAmount.value = 0;

  transactionStore.setExpenseDescription("");
  transactionStore.setExpenseAmount(0);
  // NO resetear category en el store - viene del paso anterior
  transactionStore.transactionToAdd.value.expenseId = null;
  transactionStore.transactionToAdd.value.oldOrNewExpense = null;
  transactionStore.setPayLabor(null);
  transactionStore.setOverheadUsage(null);
  transactionStore.setBucket(null);
  transactionStore.setSplits(null);
};

// ========================================
// HANDLERS PARA MATERIALS
// ========================================

/**
 * Computed: Determina si se puede agregar el material
 */
const canAddMaterial = computed(() => {
  const material = transactionStore.itemToAddInExpenseMaterial.value;

  // Validaciones básicas
  if (
    !material.description ||
    !material.quantity ||
    !material.cost ||
    !material.unit
  ) {
    return false;
  }

  // Validar que el total no exceda el saldo disponible
  const currentTotal = getMaterialsTotal();
  const newItemTotal = (material.cost || 0) * (material.quantity || 0);
  const wouldExceedBalance = currentTotal + newItemTotal > maxAmount.value;

  return !wouldExceedBalance;
});

/**
 * Maneja el agregado del material
 */
const handleAddMaterial = () => {
  transactionStore.addMaterialItemToExpense();
};

/**
 * Maneja el reset del material seleccionado
 */
const handleResetMaterial = () => {
  transactionStore.resetItemToAddInExpenseMaterial();
};

/**
 * Enfoca el input de costo cuando se presiona Enter en cantidad
 */
const focusCostInput = () => {
  if (costInputMaterial.value) {
    costInputMaterial.value.focus();
  }
};

/**
 * Maneja el Enter en el input de costo
 */
const handleAddMaterialOnEnter = () => {
  if (canAddMaterial.value) {
    handleAddMaterial();
  }
};

/**
 * Calcula el total de materiales agregados
 */
const getMaterialsTotal = () => {
  if (!transactionStore.transactionToAdd.value.materialItems) {
    return 0;
  }

  return transactionStore.transactionToAdd.value.materialItems.reduce(
    (sum, material) => {
      return sum + (material.cost || 0) * (material.quantity || 0);
    },
    0,
  );
};

/**
 * Calcula el total del material actual (no agregado aún)
 */
const getCurrentItemTotal = () => {
  const material = transactionStore.itemToAddInExpenseMaterial.value;

  if (!material.cost || !material.quantity) {
    return 0;
  }

  return (material.cost || 0) * (material.quantity || 0);
};

/**
 * Computed: Verifica si el total excedería el saldo disponible
 */
const wouldExceedBalance = computed(() => {
  const currentTotal = getMaterialsTotal();
  const newItemTotal = getCurrentItemTotal();
  return currentTotal + newItemTotal > maxAmount.value;
});

// ========================================
// CÁLCULO DE SALDO DISPONIBLE
// ========================================

// Tipo de negocio actual
const currentBusinessType = computed(
  () => businessStore.business?.businessType || null,
);

// Roles visibles de paylabor según tipo de negocio
const visiblePayLaborRoles = computed(() => {
  return getVisiblePayLaborRoles(currentBusinessType.value);
});

// ========================================
// HANDLERS PARA PAYLABOR
// ========================================

const selectPayLaborRole = (role) => {
  selectedPayLabor.value = role;
  transactionStore.setPayLabor(role);

  // Calcular bucket automáticamente
  const bucket = classifyPayroll(currentBusinessType.value, role);
  transactionStore.setBucket(bucket);
  transactionStore.setSplits(null);
};

// ========================================
// HANDLERS PARA OVERHEAD USAGE
// ========================================

const selectOverheadUsage = (usage) => {
  selectedOverheadUsage.value = usage;
  transactionStore.setOverheadUsage(usage);

  if (usage === "MIXED" && amount.value > 0) {
    // Calcular split sugerido
    const suggested = suggestSplit(
      currentBusinessType.value,
      description.value,
    );
    producePercentage.value = suggested.produce;
    adminPercentage.value = suggested.admin;
    produceAmount.value =
      Math.round(amount.value * suggested.produce * 100) / 100;
    adminAmount.value =
      Math.round((amount.value - produceAmount.value) * 100) / 100;
    updateSplitsInStore();
    transactionStore.setBucket(null);
  } else if (usage === "PRODUCE") {
    transactionStore.setBucket(Bucket.MANUFACTURING_OH);
    transactionStore.setSplits(null);
    producePercentage.value = 0;
    adminPercentage.value = 0;
    produceAmount.value = 0;
    adminAmount.value = 0;
  } else if (usage === "ADMIN") {
    transactionStore.setBucket(Bucket.OVERHEAD);
    transactionStore.setSplits(null);
    producePercentage.value = 0;
    adminPercentage.value = 0;
    produceAmount.value = 0;
    adminAmount.value = 0;
  }
};

// Handler para el slider de prorrateo
const handleSliderChange = (value) => {
  const pct = parseInt(value) / 100;
  producePercentage.value = pct;
  adminPercentage.value = 1 - pct;
  produceAmount.value = Math.round(amount.value * pct * 100) / 100;
  adminAmount.value =
    Math.round((amount.value - produceAmount.value) * 100) / 100;
  updateSplitsInStore();
};

// Handler para input de monto producción
const handleProduceAmountChange = (value) => {
  const val = parseFloat(value) || 0;
  const clamped = Math.min(Math.max(val, 0), amount.value);
  produceAmount.value = Math.round(clamped * 100) / 100;
  adminAmount.value =
    Math.round((amount.value - produceAmount.value) * 100) / 100;
  if (amount.value > 0) {
    producePercentage.value = produceAmount.value / amount.value;
    adminPercentage.value = 1 - producePercentage.value;
  }
  updateSplitsInStore();
};

// Handler para input de monto gestión
const handleAdminAmountChange = (value) => {
  const val = parseFloat(value) || 0;
  const clamped = Math.min(Math.max(val, 0), amount.value);
  adminAmount.value = Math.round(clamped * 100) / 100;
  produceAmount.value =
    Math.round((amount.value - adminAmount.value) * 100) / 100;
  if (amount.value > 0) {
    adminPercentage.value = adminAmount.value / amount.value;
    producePercentage.value = 1 - adminPercentage.value;
  }
  updateSplitsInStore();
};

// Actualizar splits en el store
const updateSplitsInStore = () => {
  transactionStore.setSplits([
    {
      bucket: Bucket.MANUFACTURING_OH,
      amount: produceAmount.value,
      percentage: producePercentage.value,
    },
    {
      bucket: Bucket.OVERHEAD,
      amount: adminAmount.value,
      percentage: adminPercentage.value,
    },
  ]);
};

// Recalcular split cuando cambia el amount y está en MIXED
watch(amount, (newAmount) => {
  if (selectedOverheadUsage.value === "MIXED" && newAmount > 0) {
    produceAmount.value =
      Math.round(newAmount * producePercentage.value * 100) / 100;
    adminAmount.value =
      Math.round((newAmount - produceAmount.value) * 100) / 100;
    updateSplitsInStore();
  }
});

// Auto-clasificar materials al entrar al step
watch(
  () => transactionStore.transactionToAdd.value.category,
  (cat) => {
    if (cat === "materials") {
      const bucket = classifyMaterials(currentBusinessType.value);
      transactionStore.setBucket(bucket);
    }
    // Reset clasificación cuando cambia categoría
    selectedPayLabor.value = null;
    selectedOverheadUsage.value = null;
    producePercentage.value = 0;
    adminPercentage.value = 0;
    produceAmount.value = 0;
    adminAmount.value = 0;
    transactionStore.setPayLabor(null);
    transactionStore.setOverheadUsage(null);
    transactionStore.setSplits(null);
  },
  { immediate: true },
);

// Cargar transacciones del día y saldos al montar el componente
onMounted(async () => {
  console.log("🔄 StepAddExpenseDetails - Montando componente...");

  // Sincronizar categoría del store (del paso anterior) con la variable local
  if (transactionStore.transactionToAdd.value.category) {
    selectedCategory.value = transactionStore.transactionToAdd.value.category;
  }

  // Cargar transacciones del día en transactionStore
  await transactionStore.getTransactionsToday();

  // Cargar transacciones en accountsBalanceStore y obtener saldos actuales
  const transactions = transactionStore.transactionsInStore.value || [];
  accountsBalanceStore.setTransactions(transactions);

  // Intentar cargar desde dailySummary para obtener saldos pre-calculados
  await accountsBalanceStore.loadFromDailySummary();

  console.log("✅ Saldos cargados:", {
    cash: saldoActualCash.value,
    bank: saldoActualBank.value,
  });

  console.log("🔍 DEBUG - Estado inicial del componente:", {
    category: transactionStore.transactionToAdd.value.category,
    selectedCategoryLocal: selectedCategory.value,
    expenseType: expenseType.value,
    amount: amount.value,
    description: description.value,
    businessType: currentBusinessType.value,
  });
});

// Calcular el monto máximo disponible basado en la cuenta seleccionada
const maxAmount = computed(() => {
  const selectedAccount = transactionStore.transactionToAdd.value.account;

  if (selectedAccount === "cash") {
    return Math.max(0, saldoActualCash.value);
  } else if (selectedAccount === "bank") {
    return Math.max(0, saldoActualBank.value);
  }

  return 0; // Si no hay cuenta seleccionada
});

// Etiqueta de la cuenta seleccionada
const selectedAccountLabel = computed(() => {
  const selectedAccount = transactionStore.transactionToAdd.value.account;
  const labels = {
    cash: "efectivo",
    bank: "digital/banco",
  };
  return labels[selectedAccount] || "cuenta";
});

// ========================================
// VALIDACIONES Y WATCHERS
// ========================================

// Observar cambios y actualizar los stores correspondientes
watch(selectedCategory, (newCategory) => {
  console.log("🔍 DEBUG - Category changed:", {
    newCategory,
    expenseType: expenseType.value,
    amount: amount.value,
  });
  transactionStore.setExpenseCategory(newCategory);
});

// Computed para verificar si todos los campos están completos (labor/overhead)
const isFormValid = computed(() => {
  // Si es materials, validar que haya items agregados
  if (transactionStore.transactionToAdd.value.category === "materials") {
    const hasMaterials =
      transactionStore.transactionToAdd.value.materialItems &&
      transactionStore.transactionToAdd.value.materialItems.length > 0;

    const totalIsValid =
      getMaterialsTotal() <= maxAmount.value && getMaterialsTotal() > 0;

    return hasMaterials && totalIsValid;
  }

  // Validación base: descripción, monto, categoría
  const baseValid =
    description.value &&
    description.value.trim() !== "" &&
    amount.value &&
    amount.value > 0 &&
    amount.value <= maxAmount.value &&
    selectedCategory.value;

  if (!baseValid) return false;

  const category = transactionStore.transactionToAdd.value.category;
  const isNew = expenseType.value === "new";

  // Si es labor + new → debe tener paylabor
  if (category === "labor" && isNew && amount.value > 0) {
    if (!selectedPayLabor.value) return false;
  }

  // Si es overhead + new → debe tener overheadUsage
  if (category === "overhead" && isNew && amount.value > 0) {
    if (!selectedOverheadUsage.value) return false;

    // Si es MIXED → splits deben sumar correctamente
    if (selectedOverheadUsage.value === "MIXED") {
      const totalSplit = produceAmount.value + adminAmount.value;
      if (Math.abs(totalSplit - amount.value) > 0.02) return false;
    }
  }

  return true;
});

// Watch para actualizar el amount en transactionToAdd cuando cambia el total de materials
watch(
  () => getMaterialsTotal(),
  (newTotal) => {
    if (transactionStore.transactionToAdd.value.category === "materials") {
      transactionStore.setExpenseAmount(newTotal);
    }
  },
);

// Validar que el monto no exceda el máximo disponible (labor/overhead)
watch(amount, (newAmount) => {
  console.log("🔍 DEBUG - Amount changed:", {
    newAmount,
    category: transactionStore.transactionToAdd.value.category,
    expenseType: expenseType.value,
  });

  if (newAmount && newAmount > maxAmount.value) {
    // Limitar automáticamente al máximo disponible
    amount.value = maxAmount.value;
  }
  transactionStore.setExpenseAmount(amount.value);
  expensesStore.modifyExpenseToAddCost(amount.value);
});

// Handler para procesar el gasto (ya no es necesario pues se maneja desde NavigationBtnBARB)
const addExpenseHandler = async () => {
  if (!isFormValid.value) {
    return;
  }

  // Configurar la cuenta en el expensesStore
  expensesStore.modifyExpenseToAddAccount(
    transactionStore.transactionToAdd.value.account,
  );

  flow.nextStep();
};
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

/* Transición Badge (aparece/desaparece con escala) */
.badge-enter-active,
.badge-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.badge-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.badge-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-4px);
}

/* Transición Fade + Scale (botón X, contador) */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Transición Slide + Fade (sección de cantidad/costo) */
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
  width: 100%;
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
input:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

/* Slider thumb styling */
.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid #6b7280;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.slider-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid #6b7280;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
