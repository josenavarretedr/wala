<template>
  <div class="space-y-8 pb-24">
    <!-- Layout principal: Dos áreas lado a lado en pantallas grandes, apiladas en móviles -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      <!-- ÁREA 1: Precio de Venta y Margen de Utilidad -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Precio y Rentabilidad</h3>
            <p class="text-xs text-gray-500">Define el precio de venta y verifica tus ganancias</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Precio de Venta -->
          <div v-if="localFormData.type !== 'RAW_MATERIAL'">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <div class="flex items-center gap-2">
                Precio de Venta (S/)
                <button
                  type="button"
                  @click="showMarginInfoModal = true"
                  class="inline-flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors"
                  aria-label="Ver fórmula de rentabilidad sobre el costo"
                >
                  <InfoCircle class="w-4 h-4" />
                </button>
                <span class="text-xs text-gray-400 font-normal">(Opcional)</span>
              </div>
            </label>
            <input
              v-model.number="localFormData.price"
              @input="handlePriceInput"
              @blur="handlePriceBlur"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold shadow-sm transition-all"
            />
            <p class="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              {{
                hasCostData
                  ? "Si cambias el precio, la rentabilidad se recalculará automáticamente."
                  : "Precio al que vendes este producto al público."
              }}
            </p>
          </div>

          <!-- Costo (Manual o Sincronizado) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <div class="flex items-center gap-2 font-semibold">
                Costo {{ localFormData.type === 'RAW_MATERIAL' ? 'de Compra (S/)' : '(S/)' }}
                <span v-if="localFormData.type !== 'RAW_MATERIAL'" class="text-xs text-gray-400 font-normal">
                  (Opcional)
                </span>
              </div>
            </label>
            <input
              v-model.number="localFormData.cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              :disabled="localFormData.type !== 'RAW_MATERIAL' && costingStore.hasAnyCost"
              :readonly="localFormData.type !== 'RAW_MATERIAL' && costingStore.hasAnyCost"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold shadow-sm transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
            <p class="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              {{
                localFormData.type === 'RAW_MATERIAL'
                  ? "Costo de adquisición del insumo básico."
                  : "Costo de adquisición o fabricación."
              }}
            </p>
            <div v-if="localFormData.type !== 'RAW_MATERIAL' && costingStore.hasAnyCost" class="mt-2.5 flex items-start gap-2 text-xs text-orange-600 font-medium bg-orange-50/60 border border-orange-100/70 p-3 rounded-xl shadow-xs animate-fade-in">
              <svg class="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Costo calculado automáticamente por el panel de Costeo Asistido.</span>
            </div>
          </div>
        </div>

        <!-- Rentabilidad puramente textual (Sin slider) -->
        <div
          v-if="hasCostData && localFormData.type !== 'RAW_MATERIAL'"
          class="bg-gradient-to-br from-purple-50/80 via-purple-50/30 to-cyan-50/40 rounded-2xl p-5 border border-purple-100/40 shadow-xs space-y-4"
        >
          <p class="text-xs font-bold text-purple-600 uppercase tracking-wider">
            Crecimiento de tu inversión
          </p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span class="text-sm font-bold text-purple-800">{{ saleMarginStatus.label }}</span>
            </div>
            <div class="text-right">
              <p class="text-2xl font-extrabold text-purple-900 tabular-nums">
                {{ saleMarginPercentage }}%
              </p>
            </div>
          </div>
          <p class="text-xs text-purple-700 leading-relaxed pt-2 border-t border-purple-100/30">
            ¡Hiciste crecer tu inversión! De cada unidad vendida, tu beneficio bruto es de 
            <strong class="text-purple-900 font-bold">S/ {{ marginAmount }}</strong> 
            (retorno calculado sobre los <strong class="text-purple-900 font-bold">S/ {{ formatPrice(localFormData.cost) }}</strong> invertidos).
          </p>
        </div>

        <!-- Mensajes informativos contextuales -->
        <div
          v-if="localFormData.type === 'RAW_MATERIAL' && !localFormData.cost"
          class="p-4 bg-amber-50/60 border border-amber-100/80 rounded-2xl flex gap-3 text-amber-800 shadow-xs"
        >
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs leading-relaxed">
            Las materias primas requieren especificar el <strong>costo de compra</strong> para calcular las recetas de tus productos manufacturados.
          </p>
        </div>

        <div
          v-else-if="localFormData.type !== 'RAW_MATERIAL' && !localFormData.price && !localFormData.cost"
          class="p-4 bg-blue-50/60 border border-blue-100/80 rounded-2xl flex gap-3 text-blue-800 shadow-xs"
        >
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs leading-relaxed">
            Puedes especificar el <strong>precio de venta</strong>, el <strong>costo de compra/producción</strong>, o utilizar el panel de costeo detallado a la derecha para calcular el costo de forma asistida.
          </p>
        </div>
      </div>

      <!-- ÁREA 2: Costeo Asistido (Wala Pro) -->
      <div
        v-if="localFormData.type !== 'RAW_MATERIAL'"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6"
      >
        <PremiumLockWrapper
          :is-premium="isPremium"
          :is-locked="!isPremium"
          @locked-click="handlePremiumClick"
        >
          <template #header>
            <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">Costeo Asistido</h3>
                  <p class="text-xs text-gray-500">Desglosa y calcula el costo real exacto</p>
                </div>
              </div>
              <span
                v-if="!isPremium"
                class="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm"
              >
                <BrightCrown class="w-3.5 h-3.5" />
                Pro
              </span>
            </div>
          </template>

          <template #content="{ contentClasses }">
            <div :class="[contentClasses, 'space-y-6']">
              <!-- Widget Resumen de Costo Total -->
              <div
                v-if="costingStore.hasAnyCost"
                class="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 space-y-4"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Costo Total Asistido</span>
                  <span class="text-3xl font-extrabold text-gray-900 tabular-nums">
                    S/ {{ formatNumber(costingStore.totalCost) }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-200/85 text-[11px]">
                  <div v-if="costingStore.hasMaterialsCost" class="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span class="font-medium">Materiales:</span>
                    <span class="font-bold">S/ {{ formatNumber(costingStore.costs.materials) }}</span>
                  </div>
                  <div v-if="costingStore.hasMODCost" class="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span class="font-medium">MOD:</span>
                    <span class="font-bold">S/ {{ formatNumber(costingStore.costs.mod) }}</span>
                  </div>
                  <div v-if="costingStore.hasCIFCost" class="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    <span class="font-medium">CIF:</span>
                    <span class="font-bold">S/ {{ formatNumber(costingStore.costs.cif) }}</span>
                  </div>
                  <div v-if="costingStore.hasOverheadCost" class="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span class="font-medium">Overhead:</span>
                    <span class="font-bold">S/ {{ formatNumber(costingStore.costs.overhead) }}</span>
                  </div>
                  <div v-if="costingStore.hasPackagingCost" class="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span class="font-medium">Envases:</span>
                    <span class="font-bold">S/ {{ formatNumber(costingStore.costs.packaging) }}</span>
                  </div>
                </div>
              </div>

              <!-- Estado Vacío cuando no hay costos configurados -->
              <div
                v-else
                class="bg-purple-50/50 rounded-2xl p-6 border border-purple-100/50 text-center space-y-3"
              >
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto shadow-xs">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h4 class="text-sm font-bold text-purple-800">Costo real automatizado</h4>
                <p class="text-xs text-purple-600/80 max-w-sm mx-auto leading-relaxed">
                  Aún no has configurado ningún costo asistido. Selecciona uno de los módulos a continuación para comenzar a desglosar el costo exacto.
                </p>
              </div>

              <!-- Grid de Tarjetas Interactivas de Costeo -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Tarjeta Materiales -->
                <button
                  type="button"
                  @click="navigateToCost('costs-materials')"
                  :class="[
                    'relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-400',
                    hasMaterialsCostStructure
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                      : 'border-gray-100 bg-gray-50/50 hover:border-emerald-200 hover:bg-emerald-50/10'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors',
                        hasMaterialsCostStructure ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-gray-800 text-sm mb-0.5">Materiales</h4>
                      <p class="text-[11px] text-gray-500 leading-normal">Materia prima e insumos por producto.</p>
                    </div>
                  </div>
                  <div v-if="hasMaterialsCostStructure" class="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-xs">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-if="hasMaterialsCostStructure" class="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs">
                    <span class="text-emerald-700 font-medium">Configurado</span>
                    <span class="font-extrabold text-emerald-600">S/ {{ formatNumber(getMaterialsCost) }}</span>
                  </div>
                </button>

                <!-- Tarjeta MOD -->
                <button
                  v-if="showMOD"
                  type="button"
                  @click="navigateToCost('costs-mod')"
                  :class="[
                    'relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-blue-400',
                    costingStore.hasMODCost
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                      : 'border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/10'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors',
                        costingStore.hasMODCost ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-gray-800 text-sm mb-0.5">Mano de Obra</h4>
                      <p class="text-[11px] text-gray-500 leading-normal">Costo de personal directo por artículo.</p>
                    </div>
                  </div>
                  <div v-if="costingStore.hasMODCost" class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-xs">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-if="costingStore.hasMODCost" class="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between text-xs">
                    <span class="text-blue-700 font-medium">Configurado</span>
                    <span class="font-extrabold text-blue-600">S/ {{ formatNumber(costingStore.costs.mod) }}</span>
                  </div>
                </button>

                <!-- Tarjeta CIF -->
                <button
                  v-if="showCIF"
                  type="button"
                  @click="navigateToCost('costs-cif')"
                  :class="[
                    'relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-purple-400',
                    costingStore.hasCIFCost
                      ? 'border-purple-500 bg-purple-50/40 shadow-sm'
                      : 'border-gray-100 bg-gray-50/50 hover:border-purple-200 hover:bg-purple-50/10'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors',
                        costingStore.hasCIFCost ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-gray-800 text-sm mb-0.5">Costos Indirectos</h4>
                      <p class="text-[11px] text-gray-500 leading-normal">Costos indirectos de producción (CIF).</p>
                    </div>
                  </div>
                  <div v-if="costingStore.hasCIFCost" class="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-xs">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-if="costingStore.hasCIFCost" class="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between text-xs">
                    <span class="text-purple-700 font-medium">Configurado</span>
                    <span class="font-extrabold text-purple-600">S/ {{ formatNumber(costingStore.costs.cif) }}</span>
                  </div>
                </button>

                <!-- Tarjeta Overhead -->
                <button
                  v-if="showOverhead"
                  type="button"
                  @click="navigateToCost('costs-overhead')"
                  :class="[
                    'relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-amber-400',
                    costingStore.hasOverheadCost
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                      : 'border-gray-100 bg-gray-50/50 hover:border-amber-200 hover:bg-amber-50/10'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors',
                        costingStore.hasOverheadCost ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-gray-800 text-sm mb-0.5">Gastos Generales</h4>
                      <p class="text-[11px] text-gray-500 leading-normal">Gastos de administración y ventas.</p>
                    </div>
                  </div>
                  <div v-if="costingStore.hasOverheadCost" class="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-xs">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-if="costingStore.hasOverheadCost" class="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs">
                    <span class="text-amber-700 font-medium">Configurado</span>
                    <span class="font-extrabold text-amber-600">S/ {{ formatNumber(costingStore.costs.overhead) }}</span>
                  </div>
                </button>

                <!-- Tarjeta Envases y Delivery -->
                <button
                  v-if="localFormData.deliveryEnabled"
                  type="button"
                  @click="navigateToCost('costs-packaging')"
                  :class="[
                    'relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-orange-400',
                    hasPackagingCostStructure
                      ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                      : 'border-gray-100 bg-gray-50/50 hover:border-orange-200 hover:bg-orange-50/10'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors',
                        hasPackagingCostStructure ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-gray-800 text-sm mb-0.5">Envases y Delivery</h4>
                      <p class="text-[11px] text-gray-500 leading-normal">Empaques para envíos y delivery externo.</p>
                    </div>
                  </div>
                  <div v-if="hasPackagingCostStructure" class="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-xs">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-if="hasPackagingCostStructure" class="mt-3 pt-2.5 border-t border-orange-100 flex items-center justify-between text-xs">
                    <span class="text-orange-700 font-medium">Configurado</span>
                    <span class="font-extrabold text-orange-600">S/ {{ formatNumber(getPackagingCost) }}</span>
                  </div>
                </button>
              </div>
            </div>
          </template>
        </PremiumLockWrapper>
      </div>

    </div>

    <!-- Modal informativo de Fórmula de Rentabilidad -->
    <div
      v-if="showMarginInfoModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showMarginInfoModal = false"
    >
      <div
        class="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
          <h3 class="text-xl font-extrabold text-slate-800 tracking-tight">
            ¿Cómo se calcula la rentabilidad?
          </h3>
          <img
            :src="walaLogoIcon"
            alt="Wala"
            class="w-12 h-12 object-contain"
          />
        </div>

        <div class="px-6 py-5 space-y-5">
          <div
            class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
          >
            <span class="text-sm font-semibold text-gray-700"
              >Ver valores de este producto</span
            >
            <button
              type="button"
              @click="showFormulaWithValues = !showFormulaWithValues"
              :aria-pressed="showFormulaWithValues"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              :class="showFormulaWithValues ? 'bg-purple-600' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                :class="
                  showFormulaWithValues ? 'translate-x-5' : 'translate-x-1'
                "
              />
            </button>
          </div>

          <p class="text-sm text-gray-600">
            Wala calcula la <strong>rentabilidad sobre el costo</strong> para garantizar que conozcas el retorno real de tu inversión en insumos o adquisición:
          </p>
          <div
            class="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-purple-900 shadow-inner"
          >
            <div
              class="flex items-center justify-center gap-4 flex-wrap formula-text text-center"
            >
              <span>Rentabilidad % =</span>
              <span class="fraction">
                <span class="fraction-top">
                  {{
                    showFormulaWithValues
                      ? `( S/ ${formatPrice(localFormData.price)} - S/ ${formatPrice(
                          localFormData.cost,
                        )} )`
                      : "( Precio - Costo )"
                  }}
                </span>
                <span class="fraction-bottom">
                  {{
                    showFormulaWithValues
                      ? `S/ ${formatPrice(localFormData.cost)}`
                      : "Costo"
                  }}
                </span>
              </span>
              <span>× 100</span>
            </div>
          </div>

          <div
            v-if="showFormulaWithValues"
            class="grid grid-cols-3 gap-2 text-center text-xs pt-2"
          >
            <div class="bg-orange-50 border border-orange-200 rounded-xl py-2.5">
              <p class="text-orange-500 font-bold">Costo</p>
              <p class="text-orange-700 font-extrabold mt-0.5">
                S/ {{ formatPrice(localFormData.cost) }}
              </p>
            </div>
            <div class="bg-purple-50 border border-purple-200 rounded-xl py-2.5">
              <p class="text-purple-500 font-bold">Rentabilidad</p>
              <p class="text-purple-700 font-extrabold mt-0.5">
                {{ saleMarginPercentage }}%
              </p>
            </div>
            <div class="bg-cyan-50 border border-cyan-200 rounded-xl py-2.5">
              <p class="text-cyan-600 font-bold">Precio</p>
              <p class="text-cyan-800 font-extrabold mt-0.5">
                S/ {{ formatPrice(localFormData.price) }}
              </p>
            </div>
          </div>

          <div
            class="flex items-center justify-center gap-2 text-orange-600 pt-3 border-t border-gray-100"
          >
            <img
              :src="walaLogoIcon"
              alt="Wala"
              class="w-5 h-5 object-contain"
            />
            <span class="text-base font-bold tracking-tight">wala.lat</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de Acción de Guardado/Navegación -->
    <NavigationBtnEditProduct
      :localData="localFormData"
      :originalData="originalData"
      :saving="saving"
      section="economic"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { BrightCrown, InfoCircle } from "@iconoir/vue";
import { useSubscription } from "@/composables/useSubscription";
import { useToast } from "@/composables/useToast";
import { useProductMetricsStore } from "@/stores/Inventory/productMetricsStore";
import { useProductCostingStore } from "@/stores/productCostingStore";
import { useBusinessStore } from "@/stores/businessStore";
import { getBusinessCapabilities } from "@/utils/businessCapabilities";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";
import NavigationBtnEditProduct from "./NavigationBtnEditProduct.vue";
import walaLogoIcon from "@/assets/WalaLogoOF.png";

// Router
const router = useRouter();
const route = useRoute();

// Subscription & Toast
const { isPremium } = useSubscription();
const toast = useToast();
const metricsStore = useProductMetricsStore();

// Stores de costeo asistido
const costingStore = useProductCostingStore();
const businessStore = useBusinessStore();

// Props
const props = defineProps({
  initialData: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["save"]);

// Estado local
const localFormData = ref({ ...props.initialData });
const originalData = ref({ ...props.initialData });
const saleMarginPercentage = ref("0.00");
const showMarginInfoModal = ref(false);
const showFormulaWithValues = ref(false);

// Capabilities
const capabilities = computed(() => {
  return getBusinessCapabilities(businessStore.business?.businessType);
});

const showMOD = computed(() => {
  if (!localFormData.value || !capabilities.value.enableMOD) return false;
  return ["PRODUCT", "SERVICE"].includes(localFormData.value.type);
});

const showCIF = computed(() => {
  if (!localFormData.value || !capabilities.value.enableCIF) return false;
  return ["PRODUCT", "SERVICE"].includes(localFormData.value.type);
});

const showOverhead = computed(() => {
  if (!localFormData.value) return false;
  return ["PRODUCT", "SERVICE", "COMBO", "MERCH"].includes(localFormData.value.type);
});

const hasMaterialsCostStructure = computed(() => {
  return (
    localFormData.value?.costStructure?.materials !== null &&
    localFormData.value?.costStructure?.materials !== undefined &&
    localFormData.value?.costStructure?.materials > 0
  );
});

const getMaterialsCost = computed(() => {
  return localFormData.value?.costStructure?.materials || 0;
});

const hasPackagingCostStructure = computed(() => {
  return (
    localFormData.value?.deliveryConfig?.packagingTotalCost !== null &&
    localFormData.value?.deliveryConfig?.packagingTotalCost !== undefined &&
    localFormData.value?.deliveryConfig?.packagingTotalCost > 0
  );
});

const getPackagingCost = computed(() => {
  return localFormData.value?.deliveryConfig?.packagingTotalCost || 0;
});

// Sync localFormData with props when they update
watch(
  () => props.initialData,
  (newData) => {
    localFormData.value = { ...newData };
    originalData.value = { ...newData };

    // Sincronizar store
    const productId = route.params.productId;
    if (productId && newData) {
      costingStore.initializeProduct(productId, newData);
    }
  },
  { deep: true, immediate: true },
);

// Sincronización del costo con el total del costo asistido (Opción A aprobada)
watch(
  () => [costingStore.totalCost, costingStore.hasAnyCost],
  ([newTotalCost, hasAny]) => {
    if (localFormData.value.type !== "RAW_MATERIAL" && hasAny) {
      localFormData.value.cost = newTotalCost !== null ? Number(newTotalCost.toFixed(2)) : null;
    }
  },
  { immediate: true },
);

// Computed: Validación de datos de costo
const hasCostData = computed(() => {
  return (
    localFormData.value.cost !== null &&
    localFormData.value.cost !== undefined &&
    localFormData.value.cost > 0
  );
});

// Computed: Cálculos de margen
const marginAmount = computed(() => {
  if (!localFormData.value.price || !localFormData.value.cost) return "0.00";
  const margin = localFormData.value.price - localFormData.value.cost;
  return margin.toFixed(2);
});

const saleMarginStatus = computed(() => {
  if (!hasCostData.value) {
    return metricsStore.getSaleMarginStatus(null);
  }
  return metricsStore.getSaleMarginStatus(
    parseFloat(saleMarginPercentage.value || "0"),
  );
});

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  return Number(price).toFixed(2);
};

const calculateSaleMarginFromPrice = (price, cost) => {
  if (!price || !cost || cost <= 0) return 0;
  return ((price - cost) / cost) * 100;
};

const applyPriceValidation = () => {
  if (localFormData.value.type === "RAW_MATERIAL") return;
  if (!hasCostData.value) return;
  if (!localFormData.value.price) return;

  if (localFormData.value.price < localFormData.value.cost) {
    localFormData.value.price = Number(localFormData.value.cost.toFixed(2));
  }
};

const handlePriceBlur = () => {
  applyPriceValidation();
  syncMarginFromCurrentPrice();
};

const syncMarginFromCurrentPrice = () => {
  if (!hasCostData.value || !localFormData.value.price) {
    saleMarginPercentage.value = "0.00";
    return;
  }

  const newMargin = calculateSaleMarginFromPrice(
    Number(localFormData.value.price),
    Number(localFormData.value.cost),
  );
  saleMarginPercentage.value = newMargin.toFixed(2);
};

const handlePriceInput = () => {
  // Manejo de input simple
};

// Recalcular margen en cambios reactivos de precio, costo o tipo de producto
watch(
  () => [localFormData.value.cost, localFormData.value.price, localFormData.value.type],
  () => {
    if (localFormData.value.type === "RAW_MATERIAL") {
      saleMarginPercentage.value = "0.00";
      return;
    }
    syncMarginFromCurrentPrice();
  },
  { immediate: true, deep: true },
);

// Navegación al flujo detallado de sub-costos
const navigateToCost = (costType) => {
  if (!isPremium.value) {
    handlePremiumClick();
    return;
  }
  router.push({
    name: getCostRouteName(costType),
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

const getCostRouteName = (costType) => {
  const routeMap = {
    "costs-materials": "CostsMaterials",
    "costs-mod": "CostsMOD",
    "costs-cif": "CostsCIF",
    "costs-overhead": "CostsOverhead",
    "costs-packaging": "CostsPackaging",
  };
  return routeMap[costType];
};

// Disparador del toast/modal de suscripción
const handlePremiumClick = () => {
  toast.premium("Costea cada producto adecuadamente", {
    actionLink: {
      text: "Actualiza a Wala Pro",
      route: `/business/${route.params.businessId}/premium`,
    },
  });
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return parseFloat(value).toFixed(2);
};

// Manejar el guardado final
const handleSave = (payload) => {
  applyPriceValidation();
  syncMarginFromCurrentPrice();
  emit("save", payload);
};
</script>

<style scoped>
/* Animaciones suaves */
input,
button {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

button:focus,
input:focus {
  outline: none;
}

/* Micro-animación en botones/tarjetas de costeo */
button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Fórmula en Modal */
.formula-text {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

.fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px;
}

.fraction-top {
  width: 100%;
  text-align: center;
  border-bottom: 2.5px solid currentColor;
  padding: 0 0.25rem 0.2rem;
}

.fraction-bottom {
  width: 100%;
  text-align: center;
  padding-top: 0.2rem;
}

@media (max-width: 768px) {
  .formula-text {
    font-size: 1rem;
  }

  .fraction {
    min-width: 160px;
  }
}

/* Animación de fade-in para la insignia de bloqueo de costo */
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
