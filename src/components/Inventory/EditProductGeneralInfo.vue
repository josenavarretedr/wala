<template>
  <div class="space-y-6 pb-24">
    <!-- Título de la sección -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Información General</h2>
      <p class="text-sm text-gray-500 mt-2">
        Edita el nombre, tipo y unidad del producto/servicio
      </p>
    </div>

    <!-- Nombre del Producto -->
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
          Nombre del Producto *
        </div>
      </label>
      <input
        v-model="localFormData.description"
        type="text"
        placeholder="Ej: Coca Cola 500ml"
        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required
      />
    </div>

    <!-- Tipo de Producto -->
    <div class="space-y-3">
      <label class="block text-sm font-medium text-gray-700">
        Tipo de Producto *
        <span class="text-xs text-gray-500 font-normal ml-2">
          (Define cómo se gestiona)
        </span>
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- MERCADERÍA -->
        <button
          type="button"
          @click="localFormData.type = 'MERCH'"
          :class="[
            'relative p-4 rounded-xl border-2 transition-all text-left',
            localFormData.type === 'MERCH'
              ? 'border-emerald-500 bg-emerald-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30',
          ]"
        >
          <div class="flex items-start gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                localFormData.type === 'MERCH'
                  ? 'bg-emerald-500'
                  : 'bg-emerald-100',
              ]"
            >
              <svg
                class="w-5 h-5"
                :class="
                  localFormData.type === 'MERCH'
                    ? 'text-white'
                    : 'text-emerald-600'
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
              <div class="font-semibold text-gray-900 mb-1">Mercadería</div>
              <p class="text-xs text-gray-600">
                Productos para compra y venta. Control automático de stock.
              </p>
            </div>
          </div>
          <div
            v-if="localFormData.type === 'MERCH'"
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
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </button>

        <!-- PRODUCTO ELABORADO -->
        <button
          type="button"
          @click="localFormData.type = 'PRODUCT'"
          :class="[
            'relative p-4 rounded-xl border-2 transition-all text-left',
            localFormData.type === 'PRODUCT'
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/30',
          ]"
        >
          <div class="flex items-start gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                localFormData.type === 'PRODUCT'
                  ? 'bg-purple-500'
                  : 'bg-purple-100',
              ]"
            >
              <svg
                class="w-5 h-5"
                :class="
                  localFormData.type === 'PRODUCT'
                    ? 'text-white'
                    : 'text-purple-600'
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
              <div class="font-semibold text-gray-900 mb-1">
                Producto Elaborado
              </div>
              <p class="text-xs text-gray-600">
                Productos con receta de producción. Control opcional de stock.
              </p>
            </div>
          </div>
          <div
            v-if="localFormData.type === 'PRODUCT'"
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
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </button>

        <!-- MATERIA PRIMA / INSUMO -->
        <button
          type="button"
          @click="localFormData.type = 'RAW_MATERIAL'"
          :class="[
            'relative p-4 rounded-xl border-2 transition-all text-left',
            localFormData.type === 'RAW_MATERIAL'
              ? 'border-amber-500 bg-amber-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30',
          ]"
        >
          <div class="flex items-start gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                localFormData.type === 'RAW_MATERIAL'
                  ? 'bg-amber-500'
                  : 'bg-amber-100',
              ]"
            >
              <svg
                class="w-5 h-5"
                :class="
                  localFormData.type === 'RAW_MATERIAL'
                    ? 'text-white'
                    : 'text-amber-600'
                "
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
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 mb-1">
                Materia Prima / Insumo
              </div>
              <p class="text-xs text-gray-600">
                Materiales usados para producir un bien o prestar un servicio.
                Solo costo, control de stock automático.
              </p>
            </div>
          </div>
          <div
            v-if="localFormData.type === 'RAW_MATERIAL'"
            class="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
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
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </button>

        <!-- SERVICIO -->
        <button
          type="button"
          @click="localFormData.type = 'SERVICE'"
          :class="[
            'relative p-4 rounded-xl border-2 transition-all text-left',
            localFormData.type === 'SERVICE'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30',
          ]"
        >
          <div class="flex items-start gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                localFormData.type === 'SERVICE'
                  ? 'bg-blue-500'
                  : 'bg-blue-100',
              ]"
            >
              <svg
                class="w-5 h-5"
                :class="
                  localFormData.type === 'SERVICE'
                    ? 'text-white'
                    : 'text-blue-600'
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
              <div class="font-semibold text-gray-900 mb-1">Servicio</div>
              <p class="text-xs text-gray-600">
                Servicios sin inventario físico. No controla stock.
              </p>
            </div>
          </div>
          <div
            v-if="localFormData.type === 'SERVICE'"
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
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- Nota informativa según tipo -->
      <div
        v-if="localFormData.type"
        class="mt-3 p-3 rounded-lg"
        :class="{
          'bg-emerald-50': localFormData.type === 'MERCH',
          'bg-purple-50': localFormData.type === 'PRODUCT',
          'bg-amber-50': localFormData.type === 'RAW_MATERIAL',
          'bg-blue-50': localFormData.type === 'SERVICE',
        }"
      >
        <p
          class="text-xs"
          :class="{
            'text-emerald-700': localFormData.type === 'MERCH',
            'text-purple-700': localFormData.type === 'PRODUCT',
            'text-amber-700': localFormData.type === 'RAW_MATERIAL',
            'text-blue-700': localFormData.type === 'SERVICE',
          }"
        >
          <span v-if="localFormData.type === 'MERCH'">
            ✓ Controla automáticamente el stock de compra/venta
          </span>
          <span v-else-if="localFormData.type === 'PRODUCT'">
            ✓ Puede tener receta de producción y controlar stock
          </span>
          <span v-else-if="localFormData.type === 'RAW_MATERIAL'">
            ✓ Solo registra costo, control de stock automático
          </span>
          <span v-else-if="localFormData.type === 'SERVICE'">
            ✓ No requiere control de stock físico
          </span>
        </p>
      </div>
    </div>

    <!-- Unidad de Medida -->
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
          Unidad de Medida *
        </div>
      </label>
      <select
        v-model="localFormData.unit"
        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        :disabled="localFormData.type === 'SERVICE'"
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
        v-if="localFormData.type === 'SERVICE'"
        class="text-xs text-gray-500 mt-1"
      >
        Los servicios solo pueden usar la unidad "Servicio"
      </p>
    </div>

    <!-- Variantes -->
    <div class="border border-gray-200 rounded-lg p-4 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Variantes
          </label>
          <p class="text-xs text-gray-500">
            Gestiona variaciones por color, talla u otros atributos.
          </p>
        </div>
        <button
          type="button"
          @click="toggleVariants"
          :disabled="!canUseVariants"
          :class="[
            'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
            localFormData.hasVariants ? 'bg-violet-600' : 'bg-gray-200',
            !canUseVariants ? 'opacity-50 cursor-not-allowed' : '',
          ]"
        >
          <span
            :class="[
              'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
              localFormData.hasVariants ? 'translate-x-7' : 'translate-x-1',
            ]"
          ></span>
        </button>
      </div>

      <div v-if="!canUseVariants" class="p-3 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-600">
          Las variantes solo están disponibles para Mercadería y Producto
          Elaborado.
        </p>
      </div>

      <div v-else-if="localFormData.hasVariants" class="space-y-4">
        <div class="space-y-2">
          <p class="text-xs font-medium text-gray-600">Plantillas rápidas</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-3 py-1.5 text-xs rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              @click="applyVariantPreset('color')"
            >
              Color: Rojo, Blanco, Negro
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              @click="applyVariantPreset('size')"
            >
              Tallas: S, M, L, XL
            </button>
          </div>
        </div>

        <div class="border border-gray-200 rounded-lg p-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-700">
                Combinaciones entre variables
              </p>
              <p class="text-xs text-gray-500">
                Si está activo, combina atributos entre sí (ej: Rojo / M).
              </p>
            </div>
            <button
              type="button"
              @click="toggleCombineAttributes"
              class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              :class="
                localFormData.variantSchema.combineAttributes
                  ? 'bg-indigo-600'
                  : 'bg-gray-200'
              "
            >
              <span
                :class="[
                  'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                  localFormData.variantSchema.combineAttributes
                    ? 'translate-x-7'
                    : 'translate-x-1',
                ]"
              ></span>
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="(attribute, attributeIndex) in localFormData.variantSchema
              .attributes"
            :key="attribute.id"
            class="border border-gray-200 rounded-lg p-3 space-y-3"
          >
            <div class="flex gap-2">
              <input
                v-model="attribute.name"
                type="text"
                placeholder="Nombre del atributo (ej: Color)"
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                @input="regenerateVariantCombos"
              />
              <button
                type="button"
                class="px-3 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                @click="removeAttribute(attributeIndex)"
              >
                Quitar
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(option, optionIndex) in attribute.options"
                :key="option.id"
                class="flex gap-2"
              >
                <input
                  v-model="option.value"
                  type="text"
                  placeholder="Opción (ej: Rojo, M)"
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  @input="regenerateVariantCombos"
                />
                <button
                  type="button"
                  class="px-3 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  @click="removeOption(attributeIndex, optionIndex)"
                >
                  Eliminar
                </button>
              </div>
              <button
                type="button"
                class="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                @click="addOption(attributeIndex)"
              >
                + Agregar opción
              </button>
            </div>
          </div>

          <button
            type="button"
            class="px-3 py-2 text-sm rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50"
            @click="addAttribute"
          >
            + Agregar atributo
          </button>
        </div>

        <div class="border border-gray-200 rounded-lg p-3 space-y-2">
          <h4 class="text-sm font-semibold text-gray-800">Combinaciones</h4>
          <p class="text-xs text-gray-500">
            {{
              localFormData.variantSchema.combineAttributes
                ? "Se generarán combinaciones entre atributos para el conteo."
                : "Se generarán variantes por opción individual para el conteo."
            }}
          </p>
          <div
            v-if="localFormData.variantCombos.length === 0"
            class="text-xs text-gray-500"
          >
            Agrega atributos y opciones válidas para generar combinaciones.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="combo in localFormData.variantCombos"
              :key="combo.id"
              class="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center p-2 bg-gray-50 rounded-lg"
            >
              <div class="sm:col-span-2">
                <p class="text-sm font-medium text-gray-800">
                  {{ combo.label }}
                </p>
              </div>
              <div
                class="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-600 font-mono"
              >
                {{ combo.sku }}
              </div>
              <div class="text-xs text-gray-500 text-right">
                Stock: {{ Number(combo.stock || 0).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fecha de Vencimiento -->
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              Producto Perecible
            </div>
          </label>
          <p class="text-xs text-gray-500">
            Activa esta opción si el producto requiere fecha de vencimiento
          </p>
        </div>

        <button
          type="button"
          @click="localFormData.isPerishable = !localFormData.isPerishable"
          :class="[
            'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2',
            localFormData.isPerishable ? 'bg-rose-600' : 'bg-gray-200',
          ]"
        >
          <span
            :class="[
              'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
              localFormData.isPerishable ? 'translate-x-7' : 'translate-x-1',
            ]"
          ></span>
        </button>
      </div>

      <div v-if="localFormData.isPerishable" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Fecha de vencimiento *
        </label>
        <input
          v-model="localFormData.expirationDate"
          type="date"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
        />
        <p class="text-xs text-gray-500 mt-1">
          Esta fecha se mostrará en la ficha del producto como alerta.
        </p>
      </div>
      <div v-else class="mt-3 p-3 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-600">
          Este producto no requiere fecha de vencimiento.
        </p>
      </div>
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
            <span v-if="localFormData.type === 'MERCH'">
              Mercadería siempre controla stock automáticamente
            </span>
            <span v-else-if="localFormData.type === 'RAW_MATERIAL'">
              Materia prima siempre controla stock automáticamente
            </span>
            <span v-else-if="localFormData.type === 'SERVICE'">
              Servicios normalmente no requieren control de stock
            </span>
            <span v-else>
              Activa si deseas hacer seguimiento del inventario
            </span>
          </p>
        </div>
        <button
          type="button"
          @click="localFormData.trackStock = !localFormData.trackStock"
          :disabled="
            localFormData.type === 'MERCH' ||
            localFormData.type === 'RAW_MATERIAL' ||
            localFormData.type === 'SERVICE'
          "
          :class="[
            'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
            localFormData.trackStock ? 'bg-teal-600' : 'bg-gray-200',
            localFormData.type === 'MERCH' ||
            localFormData.type === 'RAW_MATERIAL' ||
            localFormData.type === 'SERVICE'
              ? 'opacity-50 cursor-not-allowed'
              : '',
          ]"
        >
          <span
            :class="[
              'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
              localFormData.trackStock ? 'translate-x-7' : 'translate-x-1',
            ]"
          ></span>
        </button>
      </div>

      <!-- Mensaje informativo según estado -->
      <div
        v-if="localFormData.trackStock"
        class="mt-3 p-3 bg-teal-50 rounded-lg"
      >
        <p class="text-xs text-teal-700">
          ✓ El stock de este producto será monitoreado automáticamente
        </p>
      </div>
      <div v-else class="mt-3 p-3 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-600">
          ✗ Este
          {{ localFormData.type === "SERVICE" ? "servicio" : "producto" }} no
          tendrá seguimiento de inventario
        </p>
      </div>
    </div>

    <!-- Navegación para Guardar Cambios -->
    <NavigationBtnEditProduct
      :localData="localFormData"
      :originalData="originalData"
      :saving="saving"
      section="general"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import NavigationBtnEditProduct from "./NavigationBtnEditProduct.vue";
import { useToast } from "@/composables/useToast";

const createLocalId = (prefix = "id") => {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};

const getDefaultVariantSchema = () => ({
  combineAttributes: false,
  attributes: [
    {
      id: createLocalId("attr"),
      name: "Presentación",
      options: [{ id: createLocalId("opt"), value: "General" }],
    },
  ],
});

const hydrateFormData = (data) => ({
  ...data,
  hasVariants: Boolean(data?.hasVariants),
  variantSchema:
    data?.variantSchema && Array.isArray(data.variantSchema.attributes)
      ? {
          combineAttributes: Boolean(data.variantSchema.combineAttributes),
          attributes: data.variantSchema.attributes,
        }
      : { combineAttributes: false, attributes: [] },
  variantCombos: Array.isArray(data?.variantCombos) ? data.variantCombos : [],
});

const VARIANT_PRESETS = {
  color: {
    name: "Color",
    options: ["Rojo", "Blanco", "Negro"],
  },
  size: {
    name: "Talla",
    options: ["S", "M", "L", "XL"],
  },
};

const getProductSkuBase = () => {
  const rawProductId =
    localFormData.value?.uuid ||
    localFormData.value?.productId ||
    props.initialData?.uuid ||
    props.initialData?.productId ||
    "PRODUCT";

  const normalized = String(rawProductId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const base = normalized.slice(-6) || "PRODUCT";
  return base;
};

const buildAutoSku = (index) => {
  const base = getProductSkuBase();
  const numeric = String(index + 1).padStart(3, "0");
  return `${base}-${numeric}`;
};

const hashString = (value) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
};

const buildDeterministicVariantId = (optionIds = []) => {
  const normalizedOptionIds = [...optionIds]
    .map((optionId) => String(optionId || "").trim())
    .filter(Boolean)
    .sort();

  if (!normalizedOptionIds.length) {
    return createLocalId("var");
  }

  return `var_${hashString(normalizedOptionIds.join("|"))}`;
};

const normalizeVariantLabel = (label) => {
  return String(label || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const getDuplicateVariantLabels = (variantCombos = []) => {
  const countByLabel = new Map();

  variantCombos.forEach((combo) => {
    const normalized = normalizeVariantLabel(combo?.label);
    if (!normalized) return;
    countByLabel.set(normalized, (countByLabel.get(normalized) || 0) + 1);
  });

  return Array.from(countByLabel.entries())
    .filter(([, count]) => count > 1)
    .map(([label]) => label);
};

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
const { error: showError } = useToast();

// Estado local
const localFormData = ref(hydrateFormData(props.initialData));
const originalData = ref(hydrateFormData(props.initialData));
const duplicateVariantLabels = ref([]);

// Watch para sincronizar con props.initialData cuando cambie externamente
watch(
  () => props.initialData,
  (newData) => {
    localFormData.value = hydrateFormData(newData);
    originalData.value = hydrateFormData(newData);
  },
  { deep: true },
);

const canUseVariants = computed(() => {
  return (
    localFormData.value.type === "MERCH" ||
    localFormData.value.type === "PRODUCT"
  );
});

const getOptionMatrix = () => {
  const attributes = localFormData.value.variantSchema.attributes || [];

  const normalized = attributes
    .map((attribute) => {
      const name = (attribute.name || "").trim();
      const options = (attribute.options || [])
        .map((option) => ({
          id: option.id || createLocalId("opt"),
          value: (option.value || "").trim(),
        }))
        .filter((option) => option.value);

      return {
        ...attribute,
        id: attribute.id || createLocalId("attr"),
        name,
        options,
      };
    })
    .filter((attribute) => attribute.name && attribute.options.length > 0);

  return normalized;
};

const buildSingleVariants = (attributes) => {
  const variants = [];

  attributes.forEach((attribute) => {
    attribute.options.forEach((option) => {
      variants.push([
        {
          attributeId: attribute.id,
          attributeName: attribute.name,
          optionId: option.id,
          optionValue: option.value,
        },
      ]);
    });
  });

  return variants;
};

const buildCombinations = (attributes, index = 0, prefix = []) => {
  if (index >= attributes.length) {
    return [prefix];
  }

  const combinations = [];
  const currentAttribute = attributes[index];

  currentAttribute.options.forEach((option) => {
    combinations.push(
      ...buildCombinations(attributes, index + 1, [
        ...prefix,
        {
          attributeId: currentAttribute.id,
          attributeName: currentAttribute.name,
          optionId: option.id,
          optionValue: option.value,
        },
      ]),
    );
  });

  return combinations;
};

const regenerateVariantCombos = () => {
  const normalizedAttributes = getOptionMatrix();
  localFormData.value.variantSchema = {
    combineAttributes: Boolean(
      localFormData.value.variantSchema.combineAttributes,
    ),
    attributes: normalizedAttributes,
  };

  if (!normalizedAttributes.length) {
    localFormData.value.variantCombos = [];
    return;
  }

  const existingMap = new Map(
    (localFormData.value.variantCombos || []).map((combo) => [
      [...(combo.optionIds || [])].sort().join("|"),
      combo,
    ]),
  );

  const skuBase = getProductSkuBase();
  const skuNumbersInUse = new Set(
    (localFormData.value.variantCombos || [])
      .map((combo) =>
        String(combo?.sku || "")
          .trim()
          .toUpperCase(),
      )
      .filter((sku) => sku.startsWith(`${skuBase}-`))
      .map((sku) => Number(sku.split("-").pop()))
      .filter((number) => Number.isInteger(number) && number > 0),
  );

  let nextSkuNumber =
    skuNumbersInUse.size > 0 ? Math.max(...skuNumbersInUse) + 1 : 1;

  const combinations = localFormData.value.variantSchema.combineAttributes
    ? buildCombinations(normalizedAttributes)
    : buildSingleVariants(normalizedAttributes);

  localFormData.value.variantCombos = combinations.map((combo) => {
    const optionIds = combo.map((item) => item.optionId);
    const key = [...optionIds].sort().join("|");
    const existing = existingMap.get(key);
    const label = localFormData.value.variantSchema.combineAttributes
      ? combo.map((item) => item.optionValue).join(" / ")
      : `${combo[0]?.attributeName || "Variante"}: ${combo[0]?.optionValue || ""}`;

    let sku = existing?.sku || null;
    if (!sku) {
      sku = buildAutoSku(nextSkuNumber - 1);
      nextSkuNumber += 1;
    }

    return {
      id: buildDeterministicVariantId(optionIds),
      label,
      sku,
      optionIds,
      stock: Number(existing?.stock || 0),
      minStock:
        existing?.minStock === null || existing?.minStock === undefined
          ? null
          : Number(existing.minStock),
      isActive: existing?.isActive !== false,
    };
  });

  duplicateVariantLabels.value = getDuplicateVariantLabels(
    localFormData.value.variantCombos,
  );
};

const toggleVariants = () => {
  if (!canUseVariants.value) return;

  localFormData.value.hasVariants = !localFormData.value.hasVariants;

  if (localFormData.value.hasVariants) {
    if (
      !localFormData.value.variantSchema?.attributes ||
      localFormData.value.variantSchema.attributes.length === 0
    ) {
      localFormData.value.variantSchema = getDefaultVariantSchema();
    } else if (
      localFormData.value.variantSchema.combineAttributes === undefined
    ) {
      localFormData.value.variantSchema.combineAttributes = false;
    }
    regenerateVariantCombos();
  }
};

const toggleCombineAttributes = () => {
  localFormData.value.variantSchema.combineAttributes =
    !localFormData.value.variantSchema.combineAttributes;
  regenerateVariantCombos();
};

const applyVariantPreset = (presetKey) => {
  const preset = VARIANT_PRESETS[presetKey];
  if (!preset) return;

  if (!localFormData.value.hasVariants) {
    localFormData.value.hasVariants = true;
  }

  if (!localFormData.value.variantSchema) {
    localFormData.value.variantSchema = {
      combineAttributes: false,
      attributes: [],
    };
  }

  if (!Array.isArray(localFormData.value.variantSchema.attributes)) {
    localFormData.value.variantSchema.attributes = [];
  }

  const existingAttribute = localFormData.value.variantSchema.attributes.find(
    (attribute) =>
      (attribute.name || "").trim().toLowerCase() === preset.name.toLowerCase(),
  );

  if (existingAttribute) {
    const existingOptionValues = new Set(
      (existingAttribute.options || []).map((option) =>
        (option.value || "").trim().toLowerCase(),
      ),
    );

    preset.options.forEach((optionValue) => {
      if (!existingOptionValues.has(optionValue.toLowerCase())) {
        existingAttribute.options.push({
          id: createLocalId("opt"),
          value: optionValue,
        });
      }
    });
  } else {
    localFormData.value.variantSchema.attributes.push({
      id: createLocalId("attr"),
      name: preset.name,
      options: preset.options.map((optionValue) => ({
        id: createLocalId("opt"),
        value: optionValue,
      })),
    });
  }

  regenerateVariantCombos();
};

const addAttribute = () => {
  localFormData.value.variantSchema.attributes.push({
    id: createLocalId("attr"),
    name: "",
    options: [{ id: createLocalId("opt"), value: "" }],
  });
};

const removeAttribute = (attributeIndex) => {
  localFormData.value.variantSchema.attributes.splice(attributeIndex, 1);
  regenerateVariantCombos();
};

const addOption = (attributeIndex) => {
  localFormData.value.variantSchema.attributes[attributeIndex].options.push({
    id: createLocalId("opt"),
    value: "",
  });
};

const removeOption = (attributeIndex, optionIndex) => {
  localFormData.value.variantSchema.attributes[attributeIndex].options.splice(
    optionIndex,
    1,
  );
  regenerateVariantCombos();
};

// Computed: Opciones de unidad disponibles según el tipo de producto
const availableUnitOptions = computed(() => {
  if (localFormData.value.type === "SERVICE") {
    return [{ value: "service", label: "Servicio" }];
  }

  return [
    { value: "uni", label: "Unidad (uni)" },
    { value: "porcion", label: "Porción" },
    { value: "kg", label: "Kilogramo" },
    { value: "lt", label: "Litro" },
    { value: "m", label: "Metro" },
  ];
});

// Watch: Ajustar trackStock y unit automáticamente según el tipo
watch(
  () => localFormData.value.type,
  (newType) => {
    if (newType === "MERCH" || newType === "RAW_MATERIAL") {
      localFormData.value.trackStock = true;
      if (!localFormData.value.unit || localFormData.value.unit === "service") {
        localFormData.value.unit = "uni";
      }
    } else if (newType === "SERVICE") {
      localFormData.value.trackStock = false;
      localFormData.value.unit = "service";
    } else if (newType === "PRODUCT") {
      if (localFormData.value.unit === "service") {
        localFormData.value.unit = "uni";
      }
      // No cambia trackStock para PRODUCT (el usuario decide)
    }

    if (!canUseVariants.value) {
      localFormData.value.hasVariants = false;
    }
  },
);

watch(
  () => localFormData.value.isPerishable,
  (isPerishable) => {
    if (!isPerishable) {
      localFormData.value.expirationDate = null;
    }
  },
);

// Método para manejar el guardado
const handleSave = (payload) => {
  if (localFormData.value.isPerishable && !localFormData.value.expirationDate) {
    showError(
      "Si el producto es perecible, debes indicar la fecha de vencimiento",
    );
    return;
  }

  const duplicates = getDuplicateVariantLabels(
    localFormData.value.variantCombos || [],
  );
  duplicateVariantLabels.value = duplicates;

  if (localFormData.value.hasVariants && duplicates.length > 0) {
    showError(
      "Hay variantes con etiquetas duplicadas. Corrige antes de guardar.",
    );
    return;
  }

  emit("save", payload);
};
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
