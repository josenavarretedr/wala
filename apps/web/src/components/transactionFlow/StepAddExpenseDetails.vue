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

          <div
            v-if="
              transactionStore.itemToAddInExpenseMaterial.value.variantLabel
            "
            class="mt-2"
          >
            <span
              class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200"
            >
              {{
                transactionStore.itemToAddInExpenseMaterial.value.variantLabel
              }}
            </span>
          </div>

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

      <!-- Selector de Presentación para Compra (si tiene múltiples) -->
      <div
        v-if="
          transactionStore.itemToAddInExpenseMaterial.value.description &&
          availablePresentations.length > 1
        "
        class="space-y-2"
      >
        <label class="block text-sm font-semibold text-gray-700">
          Presentación comprada:
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="pres in availablePresentations"
            :key="pres.id"
            type="button"
            @click="selectMaterialPresentation(pres)"
            class="p-3 text-left rounded-xl border-2 transition-all flex flex-col justify-between"
            :class="[
              currentMaterialPresentation?.id === pres.id
                ? 'border-orange-500 bg-orange-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/20',
            ]"
          >
            <div class="font-bold text-xs sm:text-sm text-gray-800">
              {{ pres.name }}
            </div>
            <div class="text-[11px] text-gray-500 mt-1">
              x{{ pres.factor }} {{ baseMaterialUnit }}
            </div>
          </button>
        </div>
      </div>

      <!-- Formulario: Cantidad, Unidad y Costo -->
      <Transition name="slide-fade">
        <div
          v-if="transactionStore.itemToAddInExpenseMaterial.value.description"
          class="space-y-3"
        >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Cantidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">
                Cantidad
                <span v-if="currentMaterialPresentation?.factor > 1" class="text-xs text-orange-600 font-semibold">
                  ({{ currentMaterialPresentation.name }})
                </span>
              </label>
              <div class="relative">
                <input
                  ref="quantityInputMaterial"
                  v-model.number="
                    transactionStore.itemToAddInExpenseMaterial.value.quantity
                  "
                  type="number"
                  placeholder="0"
                  :min="isFractionalMaterialPres ? 0.01 : 0"
                  :step="isFractionalMaterialPres ? 0.01 : 1"
                  @keydown.enter="focusCostInput"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-orange-500 focus:outline-none transition-colors"
                />
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                ></div>
              </div>
              <p
                v-if="
                  currentMaterialPresentation?.factor > 1 &&
                  transactionStore.itemToAddInExpenseMaterial.value.quantity > 0
                "
                class="text-xs text-emerald-700 font-medium"
              >
                ✓ Equivale a {{ equivalentMaterialBaseQty }} {{ baseMaterialUnit }} en almacén
              </p>
              <p v-else class="text-xs text-gray-500">Ingresa la cantidad comprada</p>
            </div>

            <!-- Unidad / Presentación -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">
                {{ availablePresentations.length > 1 ? "Presentación" : "Unidad" }}
              </label>
              <div
                v-if="availablePresentations.length > 1"
                class="w-full px-4 py-3 border border-orange-200 bg-orange-50/50 rounded-xl text-orange-900 font-semibold text-sm flex items-center justify-between"
              >
                <span>{{ currentMaterialPresentation?.name }}</span>
                <span class="text-xs text-orange-700 font-normal">
                  x{{ currentMaterialPresentation?.factor }} {{ baseMaterialUnit }}
                </span>
              </div>
              <select
                v-else
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

            <!-- Costo por presentación o unidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">
                Costo (S/)
                <span v-if="currentMaterialPresentation?.factor > 1" class="text-xs text-gray-500 font-normal">
                  por {{ currentMaterialPresentation.name }}
                </span>
              </label>
              <div class="relative">
                <input
                  ref="costInputMaterial"
                  v-model.number="
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
              <p
                v-if="
                  currentMaterialPresentation?.factor > 1 &&
                  transactionStore.itemToAddInExpenseMaterial.value.cost > 0
                "
                class="text-xs text-blue-700 font-medium"
              >
                Costo base: S/ {{ equivalentMaterialUnitCost.toFixed(2) }} / {{ baseMaterialUnit }}
              </p>
              <p v-else class="text-xs text-gray-500">Costo por unidad</p>
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
                      v-if="material.variantLabel"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800 flex-shrink-0"
                    >
                      {{ material.variantLabel }}
                    </span>
                    <span
                      v-if="material.oldOrNewProduct === 'new'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0"
                    >
                      Nuevo
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                    <span class="font-medium text-gray-800">
                      {{ material.quantity }}
                      {{ material.presentationName || material.unit || "uni" }}
                    </span>
                    <span
                      v-if="material.conversionFactor > 1"
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      = {{ material.baseQuantity || (material.quantity * material.conversionFactor) }} {{ material.unit || "uni" }}
                    </span>
                    <span>•</span>
                    <span>
                      S/ {{ material.cost?.toFixed(2) || "0.00" }}/{{ material.presentationName || material.unit || "uni" }}
                      <span v-if="material.conversionFactor > 1" class="text-xs text-gray-500">
                        (S/ {{ (material.baseUnitCost ?? (material.cost / material.conversionFactor)).toFixed(2) }}/{{ material.unit }})
                      </span>
                    </span>
                    <span>•</span>
                    <span class="font-semibold text-gray-900">
                      Total: S/ {{ ((material.cost || 0) * (material.quantity || 0)).toFixed(2) }}
                    </span>
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

      <!-- Respaldo por Cotización / Alerta de Umbral sin Cotización -->
      <div
        v-if="linkedQuoteId"
        class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2"
      >
        <span>✓ Compra respaldada por cotización comparada</span>
      </div>
      <div
        v-else-if="
          purchaseQuoteThreshold > 0 &&
          getMaterialsTotal() >= purchaseQuoteThreshold
        "
        class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900"
      >
        <span>
          ⚠️ Compra ≥ umbral de cotización (S/ {{ Number(purchaseQuoteThreshold).toFixed(2) }}) sin cotización vinculada.
        </span>
        <router-link
          :to="`/business/${route.params.businessId || businessStore.business?.id}/suppliers`"
          class="font-bold text-amber-800 underline shrink-0"
        >
          Comparar cotizaciones →
        </router-link>
      </div>

      <!-- Verificación de recepción (Opcional) -->
      <div
        v-if="
          transactionStore.transactionToAdd.value.materialItems &&
          transactionStore.transactionToAdd.value.materialItems.length > 0
        "
        class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5"
      >
        <p class="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Verificación de recepción (Opcional)
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-700">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="deliveryCheck.qtyMatch" type="checkbox" class="rounded text-orange-600 focus:ring-orange-500" />
            <span>Cantidad completa</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="deliveryCheck.qualityOk" type="checkbox" class="rounded text-orange-600 focus:ring-orange-500" />
            <span>Calidad conforme</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="deliveryCheck.priceMatch" type="checkbox" class="rounded text-orange-600 focus:ring-orange-500" />
            <span>Precio coincide con lo acordado</span>
          </label>
        </div>
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
    <!-- FLUJO PARA OWNER_DRAW (Retiro personal)    -->
    <!-- ========================================== -->
    <div
      v-else-if="transactionStore.transactionToAdd.value.category === 'owner_draw'"
      class="space-y-6"
    >
      <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
          S/
        </div>
        <div class="space-y-1">
          <h3 class="text-sm font-bold text-amber-900">
            Retiro personal del dueño (No operativo)
          </h3>
          <p class="text-xs text-amber-800 leading-relaxed">
            Este retiro descuenta el dinero de tu Caja o Banco hoy, pero se registra separado de los gastos operativos para no distorsionar la ganancia real de tu negocio.
          </p>
        </div>
      </div>

      <!-- Motivo del retiro -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800 block">
          ¿Para qué fue este retiro personal?
        </label>
        <input
          v-model="withdrawalReason"
          type="text"
          placeholder="Ej: Almuerzo familiar, colegio, gastos de casa"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none transition-colors"
        />
        <div class="flex flex-wrap gap-2">
          <button
            v-for="chip in ['Gastos del hogar', 'Uso personal', 'Alimentación', 'Salud / Educación']"
            :key="chip"
            type="button"
            @click="withdrawalReason = chip"
            class="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            {{ chip }}
          </button>
        </div>
      </div>

      <!-- Monto -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800 block">
          Monto retirado (S/)
        </label>
        <div class="relative">
          <input
            v-model.number="amount"
            @keyup.enter="addExpenseHandler"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-center font-medium text-gray-700 focus:border-amber-500 focus:outline-none transition-colors"
          />
          <div class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500 rounded-full"></div>
        </div>
        <div class="flex flex-col gap-1">
          <p
            v-if="
              transactionStore.transactionToAdd.value.account &&
              maxAmount !== Infinity &&
              maxAmount > 0
            "
            class="text-xs text-blue-600 font-medium"
          >
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

      <!-- Notas -->
      <div class="space-y-2">
        <label class="text-sm font-semibold text-gray-700 block">Notas (opcional)</label>
        <textarea
          v-model="transactionStore.transactionToAdd.value.notes"
          placeholder="Detalle adicional si lo necesitas..."
          rows="2"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:border-amber-500 focus:outline-none transition-colors resize-none"
        ></textarea>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- FLUJO PARA LABOR/OVERHEAD (Gastos Simples) -->
    <!-- ========================================== -->
    <div v-else class="space-y-6">
      <!-- Selector de destinatario para Salarios del equipo (labor) -->
      <div
        v-if="transactionStore.transactionToAdd.value.category === 'labor'"
        class="space-y-3"
      >
        <div class="space-y-1">
          <h3 class="text-base sm:text-lg font-semibold text-gray-800">
            ¿A quién corresponde este salario?
          </h3>
          <p class="text-xs text-gray-500">
            Selecciona si es para el dueño, un familiar o alguien más del equipo
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Salario del dueño -->
          <button
            type="button"
            @click="selectLaborRecipient('owner_salary')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 flex flex-row sm:flex-col items-center sm:items-start gap-3 border text-left',
              laborRecipient === 'owner_salary'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border-gray-200 hover:border-emerald-200',
            ]"
          >
            <div
              :class="[
                'p-2.5 rounded-full shrink-0 transition-colors duration-200',
                laborRecipient === 'owner_salary' ? 'bg-white/20' : 'bg-emerald-100',
              ]"
            >
              <Wallet
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  laborRecipient === 'owner_salary' ? 'text-white' : 'text-emerald-600',
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-semibold block">Salario del dueño</span>
              <span class="text-xs opacity-80 block mt-0.5">Tu sueldo fijo asignado</span>
            </div>
          </button>

          <!-- Salario de los familiares -->
          <button
            type="button"
            @click="selectLaborRecipient('family_salary')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 flex flex-row sm:flex-col items-center sm:items-start gap-3 border text-left',
              laborRecipient === 'family_salary'
                ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/25'
                : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-700 border-gray-200 hover:border-teal-200',
            ]"
          >
            <div
              :class="[
                'p-2.5 rounded-full shrink-0 transition-colors duration-200',
                laborRecipient === 'family_salary' ? 'bg-white/20' : 'bg-teal-100',
              ]"
            >
              <Group
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  laborRecipient === 'family_salary' ? 'text-white' : 'text-teal-600',
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-semibold block">Salario de los familiares</span>
              <span class="text-xs opacity-80 block mt-0.5">Familiar que trabaja en el negocio</span>
            </div>
          </button>

          <!-- Otro miembro del equipo -->
          <button
            type="button"
            @click="selectLaborRecipient('other')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 flex flex-row sm:flex-col items-center sm:items-start gap-3 border text-left',
              laborRecipient === 'other'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/25'
                : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-700 border-gray-200 hover:border-purple-200',
            ]"
          >
            <div
              :class="[
                'p-2.5 rounded-full shrink-0 transition-colors duration-200',
                laborRecipient === 'other' ? 'bg-white/20' : 'bg-purple-100',
              ]"
            >
              <User
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  laborRecipient === 'other' ? 'text-white' : 'text-purple-600',
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-semibold block">Otro miembro del equipo</span>
              <span class="text-xs opacity-80 block mt-0.5">Empleados, jornales u honorarios</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Tarjeta neutra sutil cuando aún no se elige destinatario en labor -->
      <div
        v-if="
          transactionStore.transactionToAdd.value.category === 'labor' &&
          !laborRecipient
        "
        class="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-sm text-gray-500"
      >
        Selecciona una opción arriba para continuar con los detalles del salario
      </div>

      <!-- Campos inferiores (si es overhead, o labor con destinatario elegido) -->
      <div
        v-if="
          transactionStore.transactionToAdd.value.category === 'overhead' ||
          (transactionStore.transactionToAdd.value.category === 'labor' &&
            laborRecipient)
        "
        class="space-y-6"
      >
        <!-- Flujo Salario del dueño -->
        <template
          v-if="
            transactionStore.transactionToAdd.value.category === 'labor' &&
            laborRecipient === 'owner_salary'
          "
        >
          <!-- Banner auxiliar para Salario del dueño -->
          <div
            class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="space-y-0.5">
              <p class="text-sm font-bold text-emerald-900">
                Pago de Salario del Dueño
              </p>
              <p
                v-if="ownerProfileConfig.ownerSalaryAmount > 0"
                class="text-xs text-emerald-800"
              >
                Sueldo fijado en tu perfil:
                <strong
                  >S/
                  {{
                    Number(ownerProfileConfig.ownerSalaryAmount).toFixed(2)
                  }}</strong
                >
                ({{ ownerSalaryFrequencyLabel }})
              </p>
              <p v-else class="text-xs text-emerald-700">
                Tip WALA: Puedes fijar tu sueldo en Datos del Negocio para
                pre-llenarlo automáticamente.
              </p>
            </div>
            <button
              v-if="ownerProfileConfig.ownerSalaryAmount > 0"
              type="button"
              @click="amount = Number(ownerProfileConfig.ownerSalaryAmount)"
              class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0"
            >
              Aplicar S/
              {{ Number(ownerProfileConfig.ownerSalaryAmount).toFixed(2) }}
            </button>
          </div>

          <!-- Input editable de descripción del gasto -->
          <div class="space-y-2">
            <label class="text-lg font-semibold text-gray-800 block">
              Descripción del gasto
            </label>
            <input
              v-model="description"
              @input="transactionStore.setExpenseDescription(description)"
              type="text"
              placeholder="Salario del dueño"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        </template>

        <!-- Flujo Salario de los familiares -->
        <div
          v-else-if="
            transactionStore.transactionToAdd.value.category === 'labor' &&
            laborRecipient === 'family_salary'
          "
          class="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-3"
        >
          <div>
            <p class="text-sm font-bold text-teal-900">
              Pago de Salario a Familiar
            </p>
            <p class="text-xs text-teal-700">
              Indica el nombre o parentesco del familiar que apoya en el negocio
            </p>
          </div>
          <input
            v-model="familyMemberName"
            type="text"
            placeholder="Ej: Hermano (apoyo taller), Esposa (caja/ventas)"
            class="w-full px-3.5 py-2.5 bg-white border border-teal-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <!-- Campo de búsqueda de gasto (other en labor u overhead) -->
        <div v-else class="space-y-3">
          <label class="text-lg font-semibold text-gray-800">
            Descripción del Gasto
          </label>

          <!-- Componente de búsqueda asíncrona -->
          <SearchExpenseAsync
            :category="transactionStore.transactionToAdd.value.category"
            :exclude-subcategories="
              transactionStore.transactionToAdd.value.category === 'labor'
                ? ['owner_salary', 'family_salary']
                : []
            "
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
              placeholder="0.00"
              class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-center font-medium text-gray-700 focus:border-red-500 focus:outline-none transition-colors"
            />
            <div
              class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"
            ></div>
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-xs text-gray-500">Ingresa el monto total del gasto</p>
            <p
              v-if="
                transactionStore.transactionToAdd.value.account &&
                maxAmount !== Infinity &&
                maxAmount > 0
              "
              class="text-xs text-blue-600 font-medium"
            >
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
        <!-- CLASIFICACIÓN PAYLABOR                     -->
        <!-- ========================================== -->
        <Transition name="slide-fade">
          <div
            v-if="
              transactionStore.transactionToAdd.value.category === 'labor' &&
              (laborRecipient === 'owner_salary' ||
                laborRecipient === 'family_salary' ||
                (laborRecipient === 'other' &&
                  (expenseType === 'new' ||
                    (expenseType === 'old' && !selectedPayLabor))))
            "
            class="space-y-4"
          >
            <div class="space-y-2">
              <h3 class="text-base font-semibold text-gray-800">
                Este pago corresponde principalmente a...
              </h3>
              <p class="text-xs text-gray-500">
                {{
                  laborRecipient === "owner_salary"
                    ? "Selecciona el rol principal que cumples en el negocio"
                    : laborRecipient === "family_salary"
                      ? "Selecciona el rol principal del familiar en el negocio"
                      : "Selecciona el rol principal del trabajador"
                }}
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
                  >No produce ni atiende directamente (personal de caja, ventas,
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
            <!-- <button
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
                  >Ambas (En todo el negocio)</span
                >
                <span class="text-xs opacity-80 block mt-0.5"
                  >Apoya ambas áreas (alquiler, servicios generales)</span
                >
              </div>
            </button> -->
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
  </div>
</template>

<script setup>
import { useExpensesStore } from "@/stores/expensesStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useToast } from "@/composables/useToast";
import { Package, Xmark, KeyframePlus, Wallet, Group, User } from "@iconoir/vue";
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import SearchExpenseAsync from "./SearchExpenseAsync.vue";
import SearchProductForExpenseAsync from "./SearchProductForExpenseAsync.vue";
import {
  getPresentations,
  isFractionalUnit,
  toBaseQuantity,
  toBaseUnitCost,
} from "@/utils/presentationMath";
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

const route = useRoute();
const db = getFirestore(appFirebase);

// Para labor/overhead (gastos simples)
const description = ref("");
const amount = ref(null);
const selectedCategory = ref(null);
const expenseType = ref(null); // 'new' o 'old'
const selectedExpenseId = ref(null);
const selectedExpenseMetadata = ref(null);

// Presets Negocio y Dueño (Área 1)
const laborRecipient = ref(null); // 'owner_salary' | 'family_salary' | 'other' | null
const withdrawalReason = ref("");
const familyMemberName = ref("");
const ownerProfileConfig = ref({
  ownerSalaryAmount: null,
  ownerSalaryFrequency: "weekly",
  ownerSalaryTarget: null,
});

const ownerSalaryFrequencyLabel = computed(() => {
  const map = {
    weekly: "semanal",
    biweekly: "quincenal",
    monthly: "mensual",
  };
  return map[ownerProfileConfig.value.ownerSalaryFrequency] || "fijo";
});

watch(withdrawalReason, (val) => {
  if (transactionStore.transactionToAdd.value.category === "owner_draw") {
    const clean = (val || "").trim();
    const desc = clean ? `Retiro personal: ${clean}` : "Retiro personal del dueño";
    description.value = desc;
    transactionStore.setExpenseDescription(desc);
  }
});

watch(familyMemberName, (val) => {
  if (transactionStore.transactionToAdd.value.subcategory === "family_salary") {
    const clean = (val || "").trim();
    const desc = clean ? `Salario familiar: ${clean}` : "Salario de los familiares";
    description.value = desc;
    transactionStore.setExpenseDescription(desc);
  }
});

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
const inventoryStore = useInventoryStore();
const { warning: toastWarning } = useToast();

const purchaseQuoteThreshold = ref(null);
const linkedQuoteId = ref(null);
const quoteThresholdToastShown = ref(false);
const deliveryCheck = ref({
  qtyMatch: false,
  qualityOk: false,
  priceMatch: false,
});

watch(
  deliveryCheck,
  (val) => {
    const anyChecked = val.qtyMatch || val.qualityOk || val.priceMatch;
    transactionStore.transactionToAdd.value.deliveryCheck = anyChecked
      ? { ...val }
      : null;
  },
  { deep: true }
);

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

  if (expenseData.subcategory) {
    transactionStore.setExpenseSubcategory(expenseData.subcategory);
  }

  if (expenseData.subsubcategory) {
    transactionStore.transactionToAdd.value.subsubcategory = expenseData.subsubcategory;
  }

  if (expenseData.paylabor) {
    selectedPayLabor.value = expenseData.paylabor;
    transactionStore.setPayLabor(expenseData.paylabor);
  } else if (
    transactionStore.transactionToAdd.value.category === "labor" &&
    expenseData.oldOrNewExpense === "new"
  ) {
    applySingleVisiblePayLaborIfApplicable();
  }

  if (expenseData.overheadUsage) {
    selectedOverheadUsage.value = expenseData.overheadUsage;
    transactionStore.setOverheadUsage(expenseData.overheadUsage);
  }

  if (expenseData.statementLine) {
    transactionStore.transactionToAdd.value.statementLine = expenseData.statementLine;
  }

  if (expenseData.bucket) {
    transactionStore.setBucket(expenseData.bucket);
  }

  if (expenseData.splits) {
    transactionStore.setSplits(expenseData.splits);
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

  if (material.hasVariants && !material.variantId) {
    return false;
  }

  // Validar que el total no exceda el saldo disponible (solo si hay cuenta)
  const selectedAccount = transactionStore.transactionToAdd.value.account;
  if (!selectedAccount) return true;

  const currentTotal = getMaterialsTotal();
  const newItemTotal = (material.cost || 0) * (material.quantity || 0);
  const wouldExceedBalance = currentTotal + newItemTotal > maxAmount.value;

  return true;
});

/**
 * Maneja el agregado del material
 */
// ========================================
// PRESENTACIONES EN COMPRA DE MATERIALES
// ========================================
const baseMaterialUnit = computed(
  () => transactionStore.itemToAddInExpenseMaterial.value.unit || "uni"
);

const availablePresentations = computed(() => {
  const mat = transactionStore.itemToAddInExpenseMaterial.value;
  if (!mat || !mat.description) return [];
  const pres = getPresentations({
    unit: mat.unit || "uni",
    price: 0,
    hasPresentations: Boolean(mat.hasPresentations),
    presentations: mat.presentations || [],
  });
  return pres.filter((p) => !p.usage || p.usage.includes("buy"));
});

const currentMaterialPresentation = computed(() => {
  const mat = transactionStore.itemToAddInExpenseMaterial.value;
  const pId = mat.presentationId;
  return (
    availablePresentations.value.find((p) => p.id === pId) ||
    availablePresentations.value[0] || {
      id: "pres_base",
      name: baseMaterialUnit.value.toUpperCase(),
      factor: 1,
    }
  );
});

const isFractionalMaterialPres = computed(() => {
  return (
    currentMaterialPresentation.value.factor === 1 &&
    isFractionalUnit(baseMaterialUnit.value)
  );
});

const equivalentMaterialBaseQty = computed(() => {
  const qty = Number(transactionStore.itemToAddInExpenseMaterial.value.quantity || 0);
  return toBaseQuantity(qty, currentMaterialPresentation.value.factor);
});

const equivalentMaterialUnitCost = computed(() => {
  const costVal = Number(transactionStore.itemToAddInExpenseMaterial.value.cost || 0);
  return toBaseUnitCost(costVal, currentMaterialPresentation.value.factor);
});

const selectMaterialPresentation = (pres) => {
  const mat = transactionStore.itemToAddInExpenseMaterial.value;
  mat.presentationId = pres.id;
  mat.presentationName = pres.name;
  mat.conversionFactor = Number(pres.factor || 1);

  const baseCost = Number(mat.baseCost || 0);
  if (baseCost > 0) {
    mat.cost = Math.round((baseCost * mat.conversionFactor + Number.EPSILON) * 100) / 100;
  }
};

watch(
  () => transactionStore.itemToAddInExpenseMaterial.value.selectedProductUuid,
  (newUuid) => {
    if (!newUuid) return;
    const presList = availablePresentations.value;
    const initial = presList.find((p) => p.isBase) || presList[0];
    if (initial) {
      const mat = transactionStore.itemToAddInExpenseMaterial.value;
      mat.presentationId = initial.id;
      mat.presentationName = initial.name;
      mat.conversionFactor = Number(initial.factor || 1);
    }
  }
);

const handleAddMaterial = () => {
  const mat = transactionStore.itemToAddInExpenseMaterial.value;
  const pres = currentMaterialPresentation.value;
  if (pres) {
    mat.presentationId = pres.id;
    mat.presentationName = pres.name;
    mat.conversionFactor = Number(pres.factor || 1);
    mat.baseQuantity = equivalentMaterialBaseQty.value;
    mat.baseUnitCost = equivalentMaterialUnitCost.value;
  }

  const activeBusinessId = route.params.businessId || businessStore.business?.id;
  const prodId = mat.selectedProductUuid || mat.uuid;
  const existingProd = prodId
    ? (inventoryStore.allItemsInInventory.value || []).find((p) => p.uuid === prodId)
    : null;
  const prevCost = Number(existingProd?.cost || 0);
  const newUnitCost = pres
    ? Number(equivalentMaterialUnitCost.value || 0)
    : Number(mat.cost || 0);

  if (activeBusinessId && existingProd && prevCost > 0 && newUnitCost >= prevCost * 1.05) {
    const pct = Math.round(((newUnitCost - prevCost) / prevCost) * 100);
    toastWarning(
      `Este insumo subió ${pct}% vs. su costo anterior. Revisar precios de venta`,
      {
        duration: 4500,
        actionLink: {
          text: "Revisar precios de venta",
          route: `/business/${activeBusinessId}/inventory/product/${existingProd.uuid}/edit-economic-info`,
        },
      }
    );
  }

  transactionStore.addMaterialItemToExpense();

  if (
    activeBusinessId &&
    purchaseQuoteThreshold.value > 0 &&
    getMaterialsTotal() >= purchaseQuoteThreshold.value &&
    !linkedQuoteId.value &&
    !quoteThresholdToastShown.value
  ) {
    quoteThresholdToastShown.value = true;
    toastWarning(
      `Compra supera tu umbral de S/ ${Number(purchaseQuoteThreshold.value).toFixed(2)}. Comparar cotizaciones`,
      {
        duration: 4500,
        actionLink: {
          text: "Comparar cotizaciones",
          route: `/business/${activeBusinessId}/suppliers`,
        },
      }
    );
  }
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
  const selectedAccount = transactionStore.transactionToAdd.value.account;
  if (!selectedAccount) return false;

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

const applySingleVisiblePayLaborIfApplicable = () => {
  const roles = visiblePayLaborRoles.value || {};
  const visibleKeys = Object.keys(roles).filter((key) => Boolean(roles[key]));
  if (visibleKeys.length === 1 && visibleKeys[0] === "ADMIN_SUPPORT") {
    selectPayLaborRole("ADMIN_SUPPORT");
  }
};

const selectLaborRecipient = (recipient) => {
  const previousRecipient = laborRecipient.value;
  const prevSubcategory = transactionStore.transactionToAdd.value.subcategory;
  const prevPreset = transactionStore.transactionToAdd.value.expensePreset;

  laborRecipient.value = recipient;

  // Limpiar selección previa de gasto
  selectedExpenseId.value = null;
  selectedExpenseMetadata.value = null;
  transactionStore.transactionToAdd.value.expenseId = null;

  if (recipient === "owner_salary") {
    transactionStore.setExpenseSubcategory("owner_salary");
    transactionStore.transactionToAdd.value.expensePreset = "owner_salary";
    transactionStore.transactionToAdd.value.statementLine = null;
    expenseType.value = "new";
    transactionStore.transactionToAdd.value.oldOrNewExpense = "new";

    const currentDesc = (description.value || "").trim();
    const isOtherTypeDesc =
      previousRecipient === "family_salary" ||
      previousRecipient === "other" ||
      (!previousRecipient &&
        prevSubcategory !== "owner_salary" &&
        prevPreset !== "owner_salary") ||
      !currentDesc ||
      currentDesc === "Salario de los familiares" ||
      currentDesc === "Salario a familiares" ||
      currentDesc.startsWith("Salario familiar:") ||
      currentDesc.startsWith("Retiro personal");

    if (isOtherTypeDesc) {
      description.value = "Salario del dueño";
    }
    transactionStore.setExpenseDescription(description.value);

    if (
      (!amount.value || amount.value <= 0) &&
      ownerProfileConfig.value.ownerSalaryAmount > 0
    ) {
      amount.value = Number(ownerProfileConfig.value.ownerSalaryAmount);
    }

    applySingleVisiblePayLaborIfApplicable();
  } else if (recipient === "family_salary") {
    transactionStore.setExpenseSubcategory("family_salary");
    transactionStore.transactionToAdd.value.expensePreset = "family_salary";
    transactionStore.transactionToAdd.value.statementLine = null;
    expenseType.value = "new";
    transactionStore.transactionToAdd.value.oldOrNewExpense = "new";

    description.value = familyMemberName.value.trim()
      ? `Salario familiar: ${familyMemberName.value.trim()}`
      : "Salario de los familiares";
    transactionStore.setExpenseDescription(description.value);

    applySingleVisiblePayLaborIfApplicable();
  } else if (recipient === "other") {
    const currentDesc = (description.value || "").trim();
    const cameFromSalaryPreset =
      previousRecipient === "owner_salary" ||
      previousRecipient === "family_salary" ||
      prevSubcategory === "owner_salary" ||
      prevSubcategory === "family_salary" ||
      prevPreset === "owner_salary" ||
      prevPreset === "family_salary" ||
      currentDesc === "Salario del dueño" ||
      currentDesc === "Salario de los familiares" ||
      currentDesc === "Salario a familiares" ||
      currentDesc.startsWith("Salario familiar:");

    transactionStore.setExpenseSubcategory(null);
    transactionStore.transactionToAdd.value.expensePreset = null;
    transactionStore.transactionToAdd.value.statementLine = null;

    if (cameFromSalaryPreset) {
      description.value = "";
      expenseType.value = null;
      transactionStore.setExpenseDescription("");
      transactionStore.transactionToAdd.value.oldOrNewExpense = null;
    }
  }
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
  (newCat, oldCat) => {
    if (newCat === "materials") {
      const bucket = classifyMaterials(currentBusinessType.value);
      transactionStore.setBucket(bucket);
    }
    // Solo resetear clasificación cuando cambia realmente la categoría (no en montaje inicial)
    if (oldCat !== undefined && newCat !== oldCat) {
      selectedPayLabor.value = null;
      selectedOverheadUsage.value = null;
      producePercentage.value = 0;
      adminPercentage.value = 0;
      produceAmount.value = 0;
      adminAmount.value = 0;
      transactionStore.setPayLabor(null);
      transactionStore.setOverheadUsage(null);
      transactionStore.setSplits(null);
      if (newCat !== "labor") {
        laborRecipient.value = null;
      }
    }
  },
  { immediate: true },
);

// Cargar transacciones del día, perfil del negocio y saldos al montar el componente
onMounted(async () => {
  console.log("🔄 StepAddExpenseDetails - Montando componente...");

  // Sincronizar categoría del store (del paso anterior) con la variable local
  if (transactionStore.transactionToAdd.value.category) {
    selectedCategory.value = transactionStore.transactionToAdd.value.category;
  }

  // Auto-clasificar materials también en onMounted
  if (transactionStore.transactionToAdd.value.category === "materials") {
    const bucket = classifyMaterials(currentBusinessType.value);
    transactionStore.setBucket(bucket);
  }

  // Cargar perfil financiero del negocio (sueldo configurado del dueño)
  const activeBusinessId = route.params.businessId || businessStore.business?.id;
  if (activeBusinessId) {
    try {
      const profileSnap = await getDoc(
        doc(db, "businesses", activeBusinessId, "settings", "businessProfile")
      );
      if (profileSnap.exists()) {
        const pData = profileSnap.data();
        ownerProfileConfig.value = {
          ownerSalaryAmount: pData.ownerSalaryAmount ? Number(pData.ownerSalaryAmount) : null,
          ownerSalaryFrequency: pData.ownerSalaryFrequency || "weekly",
          ownerSalaryTarget: pData.ownerSalaryTarget ? Number(pData.ownerSalaryTarget) : null,
        };
        if (pData.purchaseQuoteThreshold) {
          purchaseQuoteThreshold.value = Number(pData.purchaseQuoteThreshold);
        }
      }
    } catch (err) {
      console.warn("⚠️ No se pudo cargar businessProfile para pre-llenado:", err);
    }
  }

  // Asegurar catálogo de inventario cargado para alertas de incremento de costo (>=5%)
  if (
    selectedCategory.value === "materials" &&
    (!inventoryStore.allItemsInInventory.value || inventoryStore.allItemsInInventory.value.length === 0)
  ) {
    inventoryStore.getItemsInInventory().catch(() => {});
  }

  // Restaurar estado previo desde el store si existe (ej: regreso desde Paso 3 o deep-link)
  const txToAdd = transactionStore.transactionToAdd.value;
  if (txToAdd.amount && Number(txToAdd.amount) > 0) {
    amount.value = Number(txToAdd.amount);
  }
  if (txToAdd.description) {
    description.value = txToAdd.description;
  }
  if (txToAdd.paylabor) {
    selectedPayLabor.value = txToAdd.paylabor;
  }

  // Pre-llenado desde Promociones, Cotizaciones o Pagos Fijos (query params)
  if (route.query.quoteId) {
    linkedQuoteId.value = String(route.query.quoteId);
    transactionStore.transactionToAdd.value.quoteId = linkedQuoteId.value;
  }
  if (route.query.recurringId && route.query.recurringPeriod) {
    transactionStore.transactionToAdd.value.recurringId = String(route.query.recurringId);
    transactionStore.transactionToAdd.value.recurringPeriod = String(route.query.recurringPeriod);
  }
  if (route.query.prefillName && selectedCategory.value !== "materials") {
    expenseType.value = "new";
    transactionStore.transactionToAdd.value.oldOrNewExpense = "new";
    description.value = String(route.query.prefillName);
    transactionStore.setExpenseDescription(description.value);
  }
  if (
    route.query.prefillAmount &&
    selectedCategory.value !== "materials" &&
    Number(route.query.prefillAmount) > 0
  ) {
    amount.value = Number(route.query.prefillAmount);
  }

  // Inicializar presets de Área 1 (Negocio y Dueño)
  const currentCat = transactionStore.transactionToAdd.value.category;
  const currentSubcat = transactionStore.transactionToAdd.value.subcategory;
  const currentPreset = transactionStore.transactionToAdd.value.expensePreset;

  if (currentCat === "owner_draw") {
    expenseType.value = "new";
    transactionStore.transactionToAdd.value.oldOrNewExpense = "new";
    transactionStore.transactionToAdd.value.statementLine = "owner_draw";
    transactionStore.setExpenseSubcategory("personal_withdrawal");
    if (!withdrawalReason.value) {
      description.value = transactionStore.transactionToAdd.value.description || "Retiro personal del dueño";
      transactionStore.setExpenseDescription(description.value);
    }
  } else if (currentCat === "labor") {
    if (currentSubcat === "owner_salary" || currentPreset === "owner_salary") {
      selectLaborRecipient("owner_salary");
    } else if (currentSubcat === "family_salary" || currentPreset === "family_salary") {
      if (description.value && description.value.startsWith("Salario familiar: ")) {
        familyMemberName.value = description.value
          .slice("Salario familiar: ".length)
          .trim();
      }
      selectLaborRecipient("family_salary");
    } else if (transactionStore.transactionToAdd.value.description) {
      laborRecipient.value = "other";
      description.value = transactionStore.transactionToAdd.value.description;
      if (txToAdd.amount && Number(txToAdd.amount) > 0) {
        amount.value = Number(txToAdd.amount);
      }
      if (txToAdd.oldOrNewExpense) {
        expenseType.value = txToAdd.oldOrNewExpense;
      }
      if (txToAdd.expenseId) {
        selectedExpenseId.value = txToAdd.expenseId;
      }
      if (txToAdd.paylabor) {
        selectedPayLabor.value = txToAdd.paylabor;
      }
    } else {
      laborRecipient.value = null;
    }
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

  return Infinity; // Devuelve infinito si no se ha elegido cuenta aún
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
      getMaterialsTotal() > 0;

    return hasMaterials && totalIsValid;
  }

  // Validación base: descripción, monto, categoría
  const baseValid =
    description.value &&
    description.value.trim() !== "" &&
    amount.value &&
    amount.value > 0 &&

    selectedCategory.value;

  if (!baseValid) return false;

  const category = transactionStore.transactionToAdd.value.category;
  const isNew = expenseType.value === "new";

  // Si es labor → debe tener destinatario elegido y paylabor para owner_salary, family_salary y other + new
  if (category === "labor") {
    if (!laborRecipient.value) return false;
    if (
      laborRecipient.value === "owner_salary" ||
      laborRecipient.value === "family_salary" ||
      (laborRecipient.value === "other" && isNew)
    ) {
      if (!selectedPayLabor.value) return false;
    }
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
    // Permite devengado sin recortar al saldo de caja
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
