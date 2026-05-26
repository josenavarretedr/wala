<template>
  <div class="space-y-6 max-w-4xl mx-auto mb-20 px-4">
    <!-- Título y Encabezado de Consultoría -->
    <div
      class="bg-gradient-to-br from-red-50/40 via-white to-red-50/15 border-2 border-red-100 rounded-2xl p-6 text-gray-800 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      <div
        class="absolute right-0 bottom-0 text-red-500/5 translate-y-1/4 translate-x-1/4 select-none pointer-events-none"
      >
        <svg
          class="w-64 h-64"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 3v18h18" />
          <path d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      </div>
      <div class="space-y-3 relative z-10">
        <!-- <span
          class="inline-flex items-center px-3 py-1 bg-red-50 border border-red-100/70 text-red-650 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
        >
          Módulo de Consultoría
        </span> -->
        <div class="space-y-1">
          <h1
            class="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2"
          >
            <Reports class="w-7 h-7 text-red-500" />
            Estado de Resultados
          </h1>
          <p
            class="text-xs sm:text-sm text-gray-500 font-medium max-w-xl leading-relaxed"
          >
            El termómetro definitivo de tu negocio. Descubre con precisión de
            cirujano cuánto vendes, dónde se va tu dinero y cuál es tu ganancia
            neta real sobre lo vendido.
          </p>
        </div>
      </div>
    </div>

    <!-- Filtro de Período -->
    <div
      class="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div class="space-y-1">
        <span
          class="text-[10px] text-gray-400 uppercase font-bold tracking-wider"
          >Periodo de Análisis</span
        >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="range in rangeOptions"
            :key="range.value"
            @click="selectRangeOption(range.value)"
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border',
              selectedRangeOption === range.value
                ? 'bg-red-500 text-white border-red-500 shadow-xs'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900',
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Date Pickers (Custom Range) -->
      <Transition name="slide-fade">
        <div
          v-if="selectedRangeOption === 'custom'"
          class="flex items-center gap-2 border-t border-gray-100 pt-3 md:border-t-0 md:pt-0"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-[9px] text-gray-400 font-bold uppercase"
              >Inicio</span
            >
            <input
              type="date"
              v-model="customStartDate"
              class="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-red-500"
            />
          </div>
          <span class="text-gray-300 text-sm mt-3">al</span>
          <div class="flex flex-col gap-0.5">
            <span class="text-[9px] text-gray-400 font-bold uppercase"
              >Fin</span
            >
            <input
              type="date"
              v-model="customEndDate"
              class="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Loader -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 shadow-xs"
    >
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"
      ></div>
      <p class="text-xs text-gray-500 font-bold mt-3 uppercase tracking-wider">
        Analizando transacciones del período...
      </p>
    </div>

    <template v-else>
      <!-- Estado de Resultados Detallado -->
      <div class="space-y-4" v-if="hasData">
        <!-- (+) VENTAS TOTALES -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 overflow-hidden"
        >
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-gray-50/20 transition-colors"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-green-100 text-green-800 font-extrabold rounded text-[10px] sm:text-xs tracking-tight shrink-0"
                  >(+)</span
                >
                <GraphUp class="w-5 h-5 text-emerald-500 shrink-0" />
                <button
                  @click="toggleLineDetails('sales_revenue')"
                  class="font-extrabold text-gray-900 text-sm text-left hover:underline focus:outline-none"
                >
                  VENTAS TOTALES
                </button>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Es todo el dinero que ingresó al negocio por ventas de productos
                o servicios. Esto es facturación bruta (flujo de ingresos sin
                descontar costos).
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-base font-black text-green-700 leading-tight block"
                >{{ formatCurrency(lines.sales_revenue) }}</span
              >
            </div>
          </div>

          <!-- Accordion de Transacciones -->
          <Transition name="expand">
            <div
              v-if="activeLineDetails === 'sales_revenue'"
              class="bg-gray-50/80 px-6 py-4 border-t border-gray-100 space-y-3"
            >
              <h4
                class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
              >
                Desglose por Conceptos de Ventas
              </h4>
              <div
                v-if="lineTransactions.sales_revenue.length === 0"
                class="text-gray-400 italic text-xs"
              >
                No se registraron ventas en este período.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="sub in lineTransactions.sales_revenue"
                  :key="sub.key"
                  class="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <button
                        @click="
                          toggleSubcategoryDetails('sales_revenue', sub.key)
                        "
                        class="w-5 h-5 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-750 rounded-md text-[10px] font-bold select-none transition-colors shrink-0"
                      >
                        {{
                          activeSubcategoryDetails["sales_revenue"] === sub.key
                            ? "−"
                            : "+"
                        }}
                      </button>
                      <span
                        class="font-bold text-gray-900 text-[11px] truncate"
                        >{{ sub.name }}</span
                      >
                    </div>
                    <span class="font-black text-green-700 text-xs shrink-0">{{
                      formatCurrency(sub.amount)
                    }}</span>
                  </div>

                  <Transition name="expand">
                    <div
                      v-if="
                        activeSubcategoryDetails['sales_revenue'] === sub.key
                      "
                      class="pl-6 pt-2 border-t border-gray-50 space-y-1.5 max-h-[160px] overflow-y-auto pr-1"
                    >
                      <div
                        v-if="sub.txs.length === 0"
                        class="text-gray-400 italic text-[10px] py-1"
                      >
                        No se registraron movimientos en este concepto.
                      </div>
                      <div
                        v-else
                        v-for="t in sub.txs"
                        :key="t.uuid"
                        class="flex flex-col py-1 border-b border-gray-50/55 gap-0.5"
                      >
                        <div
                          class="flex justify-between text-[11px] text-gray-900 font-bold"
                        >
                          <span class="truncate mr-2">{{ t.description }}</span>
                          <span class="font-black text-green-700 shrink-0">{{
                            formatCurrency(t.amount)
                          }}</span>
                        </div>
                        <span
                          v-if="t.detail"
                          class="text-[9px] text-gray-400 font-medium leading-normal"
                          >{{ t.detail }}</span
                        >
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- (-) Costo de Ventas -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 overflow-hidden"
        >
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-gray-50/20 transition-colors"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-red-100 text-red-800 font-extrabold rounded text-[10px] sm:text-xs tracking-tight shrink-0"
                  >(-)</span
                >
                <GraphDown class="w-5 h-5 text-red-500 shrink-0" />
                <button
                  @click="toggleLineDetails('cogs')"
                  class="font-extrabold text-gray-800 text-sm text-left hover:underline focus:outline-none"
                >
                  Costo de Ventas (Materiales/Operación Directa)
                </button>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Lo que costó directamente fabricar o prestar el servicio
                vendido: insumos de lo vendido (`{{
                  formatCurrency(lines.cogs_materials)
                }}`), sueldos a destajo del personal MOD (`{{
                  formatCurrency(lines.cogs_labor)
                }}`) e indirectos de producción CIF (`{{
                  formatCurrency(lines.cogs_cif)
                }}`).
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-base font-extrabold text-red-600 leading-tight block"
                >{{ formatCurrency(totals.totalCogs) }}</span
              >
            </div>
          </div>

          <!-- Accordion de Transacciones -->
          <Transition name="expand">
            <div
              v-if="activeLineDetails === 'cogs'"
              class="bg-gray-50/80 px-6 py-5 border-t border-gray-100 space-y-4"
            >
              <!-- Comparativa Educativa e Informativa de Devengado (Siempre Visible) -->
              <div
                class="bg-white rounded-xl border border-gray-200 p-4 space-y-2 shadow-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm">💡</span>
                  <h5
                    class="text-xs font-black text-gray-800 uppercase tracking-wider"
                  >
                    Devengado vs. Flujo de Caja
                  </h5>
                </div>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-medium text-gray-600 pt-1"
                >
                  <div
                    class="space-y-1 border-b sm:border-b-0 sm:border-r border-gray-100 pb-2 sm:pb-0 sm:pr-3"
                  >
                    <span
                      class="text-gray-400 text-[10px] font-bold uppercase tracking-wide block"
                      >Costo de Insumos de Ventas (P&L)</span
                    >
                    <strong class="text-sm font-black text-red-600 block">{{
                      formatCurrency(lines.cogs_materials)
                    }}</strong>
                    <p class="leading-relaxed text-gray-500 text-[10px]">
                      El valor de los insumos que
                      <strong>efectivamente salieron de tu almacén</strong> al
                      entregarse los productos vendidos.
                    </p>
                  </div>
                  <div class="space-y-1 sm:pl-3">
                    <span
                      class="text-gray-400 text-[10px] font-bold uppercase tracking-wide block"
                      >Compras Físicas del Mes (Flujo de Caja)</span
                    >
                    <strong class="text-sm font-black text-gray-900 block">{{
                      formatCurrency(comprasBrutasInsumos)
                    }}</strong>
                    <p class="leading-relaxed text-gray-500 text-[10px]">
                      El dinero total que
                      <strong>gastaste físicamente</strong> este mes comprando
                      insumos en egresos (algunos para stock futuro).
                    </p>
                  </div>
                </div>
                <div
                  class="mt-3 pt-2.5 border-t border-gray-100 text-[10px] text-gray-500 leading-relaxed"
                >
                  <span class="font-bold text-gray-800">Nota Contable:</span>
                  Compraste
                  <strong class="text-gray-800">{{
                    formatCurrency(comprasBrutasInsumos)
                  }}</strong>
                  en materiales este mes, pero para no distorsionar tu
                  rentabilidad, tu Estado de Resultados solo resta los
                  <strong class="text-red-600">{{
                    formatCurrency(lines.cogs_materials)
                  }}</strong>
                  correspondientes a lo que sí vendiste. La diferencia queda
                  guardada en tu almacén como un <strong>Activo</strong>.
                </div>
              </div>

              <!-- Subcategorías del Costo de Ventas (Doble Nivel Jerárquico) -->
              <div class="space-y-2">
                <h4
                  class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                >
                  Desglose por Insumos y Costos Asociados
                </h4>
                <div
                  v-for="sub in lineTransactions.cogs"
                  :key="sub.key"
                  class="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <button
                        @click="toggleSubcategoryDetails('cogs', sub.key)"
                        class="w-5 h-5 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-[10px] font-bold select-none transition-colors shrink-0"
                      >
                        {{
                          activeSubcategoryDetails["cogs"] === sub.key
                            ? "−"
                            : "+"
                        }}
                      </button>
                      <span
                        class="font-bold text-gray-900 text-[11px] truncate"
                        >{{ sub.name }}</span
                      >
                    </div>
                    <span class="font-black text-red-600 text-xs shrink-0">{{
                      formatCurrency(sub.amount)
                    }}</span>
                  </div>

                  <Transition name="expand">
                    <div
                      v-if="activeSubcategoryDetails['cogs'] === sub.key"
                      class="pl-6 pt-2 border-t border-gray-50 space-y-1.5 max-h-[160px] overflow-y-auto pr-1"
                    >
                      <div
                        v-if="sub.txs.length === 0"
                        class="text-gray-400 italic text-[10px] py-1"
                      >
                        No se registraron movimientos en este concepto.
                      </div>
                      <div
                        v-else
                        v-for="t in sub.txs"
                        :key="t.uuid"
                        class="flex flex-col py-1 border-b border-gray-50/55 gap-0.5"
                      >
                        <div
                          class="flex justify-between text-[11px] text-gray-900 font-bold"
                        >
                          <span class="truncate mr-2">{{ t.description }}</span>
                          <span class="font-black text-red-600 shrink-0">{{
                            formatCurrency(t.amount)
                          }}</span>
                        </div>
                        <span
                          v-if="t.detail"
                          class="text-[9px] text-gray-400 font-medium leading-normal"
                          >{{ t.detail }}</span
                        >
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- (=) GANANCIA BRUTA -->
        <div
          class="bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 rounded-2xl border-2 border-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.12)] ring-4 ring-amber-100/70 hover:ring-amber-200 hover:border-amber-600 transition-all duration-300 relative overflow-hidden"
        >
          <div class="px-6 py-5 flex items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold rounded text-xs tracking-tight shrink-0"
                  >(=)</span
                >
                <Coins class="w-5 h-5 text-amber-500 shrink-0" />
                <h3
                  class="font-black text-amber-700 text-sm uppercase tracking-wider"
                >
                  GANANCIA BRUTA
                </h3>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Primer termómetro de salud: Es lo que queda libre solo por el
                producto. Si este número es muy chiquito, cobras muy barato o
                los insumos te salen muy caros.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-lg font-black text-amber-700 leading-tight block"
                >{{ formatCurrency(totals.grossProfit) }}</span
              >
            </div>
          </div>
        </div>

        <!-- (-) Gastos de Operación -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 overflow-hidden"
        >
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-gray-50/20 transition-colors"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-red-100 text-red-800 font-extrabold rounded text-[10px] sm:text-xs tracking-tight shrink-0"
                  >(-)</span
                >
                <Package class="w-5 h-5 text-indigo-500 shrink-0" />
                <button
                  @click="toggleLineDetails('opex_fixed')"
                  class="font-extrabold text-gray-800 text-sm text-left hover:underline focus:outline-none"
                >
                  Gastos de Operación (Fijos / Estructura)
                </button>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Los gastos que existen para abrir las puertas, vendas o no
                vendas: el alquiler del taller/local, el sueldo fijo de
                vendedores, luz comercial, agua, internet, y soporte.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-base font-extrabold text-red-600 leading-tight block"
                >{{ formatCurrency(lines.opex_fixed) }}</span
              >
            </div>
          </div>

          <!-- Accordion de Transacciones -->
          <Transition name="expand">
            <div
              v-if="activeLineDetails === 'opex_fixed'"
              class="bg-gray-50/80 px-6 py-4 border-t border-gray-100 space-y-3"
            >
              <h4
                class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
              >
                Desglose por Subcategorías
              </h4>
              <div
                v-if="lineTransactions.opex_fixed.length === 0"
                class="text-gray-400 italic text-xs"
              >
                No se registraron gastos operativos.
              </div>
              <div v-else class="space-y-2">
                <!-- Iterar por subcategorías agrupadas -->
                <div
                  v-for="sub in lineTransactions.opex_fixed"
                  :key="sub.key"
                  class="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <button
                        @click="toggleSubcategoryDetails('opex_fixed', sub.key)"
                        class="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold select-none transition-colors shrink-0"
                      >
                        {{
                          activeSubcategoryDetails["opex_fixed"] === sub.key
                            ? "−"
                            : "+"
                        }}
                      </button>
                      <span
                        class="font-bold text-gray-900 text-[11px] truncate"
                        >{{ sub.name }}</span
                      >
                    </div>
                    <span class="font-black text-gray-900 text-xs shrink-0">{{
                      formatCurrency(sub.amount)
                    }}</span>
                  </div>

                  <!-- Sub-desplegable de transacciones individuales -->
                  <Transition name="expand">
                    <div
                      v-if="activeSubcategoryDetails['opex_fixed'] === sub.key"
                      class="pl-6 pt-2 border-t border-gray-50 space-y-1.5 max-h-[120px] overflow-y-auto pr-1"
                    >
                      <div
                        v-for="t in sub.txs"
                        :key="t.uuid"
                        class="flex justify-between text-[10px] text-gray-500 py-0.5 border-b border-gray-50"
                      >
                        <span class="truncate mr-2">{{ t.description }}</span>
                        <span class="font-bold text-gray-800 shrink-0">{{
                          formatCurrency(t.amount)
                        }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- (-) Gastos de Ventas -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 overflow-hidden"
        >
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-gray-50/20 transition-colors"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-red-100 text-red-800 font-extrabold rounded text-[10px] sm:text-xs tracking-tight shrink-0"
                  >(-)</span
                >
                <Megaphone class="w-5 h-5 text-rose-500 shrink-0" />
                <button
                  @click="toggleLineDetails('opex_sales')"
                  class="font-extrabold text-gray-800 text-sm text-left hover:underline focus:outline-none"
                >
                  Gastos de Ventas (Marketing / Delivery / Envases)
                </button>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Publicidad en Meta/Google Ads, costos de motorizados/plataformas
                para entrega de pedidos (comisiones de Rappi/PedidosYa), y el
                costo de los envases y empaques utilizados para los despachos.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-base font-extrabold text-red-600 leading-tight block"
                >{{ formatCurrency(lines.opex_sales) }}</span
              >
            </div>
          </div>

          <!-- Accordion de Transacciones -->
          <Transition name="expand">
            <div
              v-if="activeLineDetails === 'opex_sales'"
              class="bg-gray-50/80 px-6 py-4 border-t border-b border-gray-100 space-y-3"
            >
              <h4
                class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
              >
                Desglose por Subcategorías
              </h4>
              <div
                v-if="lineTransactions.opex_sales.length === 0"
                class="text-gray-400 italic text-xs"
              >
                No se registraron gastos de ventas.
              </div>
              <div v-else class="space-y-2">
                <!-- Iterar por subcategorías agrupadas -->
                <div
                  v-for="sub in lineTransactions.opex_sales"
                  :key="sub.key"
                  class="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <button
                        @click="toggleSubcategoryDetails('opex_sales', sub.key)"
                        class="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold select-none transition-colors shrink-0"
                      >
                        {{
                          activeSubcategoryDetails["opex_sales"] === sub.key
                            ? "−"
                            : "+"
                        }}
                      </button>
                      <span
                        class="font-bold text-gray-900 text-[11px] truncate"
                        >{{ sub.name }}</span
                      >
                    </div>
                    <span class="font-black text-gray-900 text-xs shrink-0">{{
                      formatCurrency(sub.amount)
                    }}</span>
                  </div>

                  <!-- Sub-desplegable de transacciones individuales -->
                  <Transition name="expand">
                    <div
                      v-if="activeSubcategoryDetails['opex_sales'] === sub.key"
                      class="pl-6 pt-2 border-t border-gray-50 space-y-1.5 max-h-[120px] overflow-y-auto pr-1"
                    >
                      <div
                        v-for="t in sub.txs"
                        :key="t.uuid"
                        class="flex justify-between text-[10px] text-gray-500 py-0.5 border-b border-gray-50"
                      >
                        <span class="truncate mr-2">{{ t.description }}</span>
                        <span class="font-bold text-gray-800 shrink-0">{{
                          formatCurrency(t.amount)
                        }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- (-) Depreciación de Maquinaria -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 overflow-hidden"
        >
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-gray-50/20 transition-colors"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-red-100 text-red-800 font-extrabold rounded text-[10px] sm:text-xs tracking-tight shrink-0"
                  >(-)</span
                >
                <Settings class="w-5 h-5 text-gray-500 shrink-0" />
                <button
                  @click="toggleLineDetails('depreciation')"
                  class="font-extrabold text-gray-800 text-sm text-left hover:underline focus:outline-none"
                >
                  Depreciación de Maquinaria (Reserva Contable)
                </button>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Una reserva invisible. Guardar un monto estimado al mes por el
                desgaste de tus activos productivos te asegura tener dinero en
                el futuro para repararlos o comprarlos nuevos sin deuda.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-base font-extrabold text-red-600 leading-tight block"
                >{{ formatCurrency(lines.depreciation) }}</span
              >
            </div>
          </div>

          <!-- Accordion de Transacciones -->
          <Transition name="expand">
            <div
              v-if="activeLineDetails === 'depreciation'"
              class="bg-gray-50/80 px-6 py-4 border-t border-b border-gray-100 space-y-3"
            >
              <h4
                class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
              >
                Desglose por Subcategorías
              </h4>
              <div
                v-if="lineTransactions.depreciation.length === 0"
                class="text-gray-400 italic text-xs"
              >
                No se registraron ajustes por depreciación en este período.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="sub in lineTransactions.depreciation"
                  :key="sub.key"
                  class="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <button
                        @click="
                          toggleSubcategoryDetails('depreciation', sub.key)
                        "
                        class="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold select-none transition-colors shrink-0"
                      >
                        {{
                          activeSubcategoryDetails["depreciation"] === sub.key
                            ? "−"
                            : "+"
                        }}
                      </button>
                      <span
                        class="font-bold text-gray-900 text-[11px] truncate"
                        >{{ sub.name }}</span
                      >
                    </div>
                    <span class="font-black text-gray-900 text-xs shrink-0">{{
                      formatCurrency(sub.amount)
                    }}</span>
                  </div>

                  <Transition name="expand">
                    <div
                      v-if="
                        activeSubcategoryDetails['depreciation'] === sub.key
                      "
                      class="pl-6 pt-2 border-t border-gray-50 space-y-1.5 max-h-[120px] overflow-y-auto pr-1"
                    >
                      <div
                        v-for="t in sub.txs"
                        :key="t.uuid"
                        class="flex justify-between text-[10px] text-gray-500 py-0.5 border-b border-gray-50"
                      >
                        <span class="truncate mr-2">{{ t.description }}</span>
                        <span class="font-bold text-gray-800 shrink-0">{{
                          formatCurrency(t.amount)
                        }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- (=) GANANCIA OPERATIVA -->
        <div
          class="bg-gradient-to-br from-indigo-50/30 via-white to-indigo-50/10 rounded-2xl border-2 border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.12)] ring-4 ring-indigo-100/70 hover:ring-indigo-200 hover:border-indigo-600 transition-all duration-300 relative overflow-hidden"
        >
          <div class="px-6 py-5 flex items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold rounded text-xs tracking-tight shrink-0"
                  >(=)</span
                >
                <Coins class="w-5 h-5 text-indigo-600 shrink-0" />
                <h3
                  class="font-black text-indigo-600 text-sm uppercase tracking-wider"
                >
                  GANANCIA OPERATIVA
                </h3>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Segundo termómetro: Demuestra si el negocio en sí mismo es
                rentable y eficiente en su día a día operativo, sumando
                fabricación, venta y oficinas.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-lg font-black text-indigo-600 leading-tight block"
                >{{ formatCurrency(totals.operatingProfit) }}</span
              >
            </div>
          </div>
        </div>

        <!-- (-) Gastos Financieros -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 overflow-hidden"
        >
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-gray-50/20 transition-colors"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-red-100 text-red-800 font-extrabold rounded text-[10px] sm:text-xs tracking-tight shrink-0"
                  >(-)</span
                >
                <Safe class="w-5 h-5 text-blue-500 shrink-0" />
                <button
                  @click="toggleLineDetails('financial')"
                  class="font-extrabold text-gray-800 text-sm text-left hover:underline focus:outline-none"
                >
                  Gastos Financieros (Intereses / POS)
                </button>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Intereses pagados por préstamos comerciales y comisiones
                cobradas por bancos o pasarelas de pago. El abono al capital del
                préstamo no va aquí (solo el interés).
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-base font-extrabold text-red-600 leading-tight block"
                >{{ formatCurrency(lines.financial) }}</span
              >
            </div>
          </div>

          <!-- Accordion de Transacciones -->
          <Transition name="expand">
            <div
              v-if="activeLineDetails === 'financial'"
              class="bg-gray-50/80 px-6 py-4 border-t border-b border-gray-100 space-y-3"
            >
              <h4
                class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
              >
                Desglose por Subcategorías
              </h4>
              <div
                v-if="lineTransactions.financial.length === 0"
                class="text-gray-400 italic text-xs"
              >
                No se registraron gastos financieros.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="sub in lineTransactions.financial"
                  :key="sub.key"
                  class="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <button
                        @click="toggleSubcategoryDetails('financial', sub.key)"
                        class="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold select-none transition-colors shrink-0"
                      >
                        {{
                          activeSubcategoryDetails["financial"] === sub.key
                            ? "−"
                            : "+"
                        }}
                      </button>
                      <span
                        class="font-bold text-gray-900 text-[11px] truncate"
                        >{{ sub.name }}</span
                      >
                    </div>
                    <span class="font-black text-gray-900 text-xs shrink-0">{{
                      formatCurrency(sub.amount)
                    }}</span>
                  </div>

                  <Transition name="expand">
                    <div
                      v-if="activeSubcategoryDetails['financial'] === sub.key"
                      class="pl-6 pt-2 border-t border-gray-50 space-y-1.5 max-h-[120px] overflow-y-auto pr-1"
                    >
                      <div
                        v-for="t in sub.txs"
                        :key="t.uuid"
                        class="flex justify-between text-[10px] text-gray-500 py-0.5 border-b border-gray-50"
                      >
                        <span class="truncate mr-2">{{ t.description }}</span>
                        <span class="font-bold text-gray-800 shrink-0">{{
                          formatCurrency(t.amount)
                        }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- (=) UTILIDAD ANTES DE IMPUESTOS -->
        <div
          class="bg-gradient-to-br from-gray-50/20 to-white rounded-2xl border-2 border-gray-300 shadow-xs relative overflow-hidden transition-all duration-200"
        >
          <div class="px-6 py-5 flex items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-gray-200 text-gray-700 font-extrabold rounded text-xs tracking-tight shrink-0"
                  >(=)</span
                >
                <Coins class="w-5 h-5 text-gray-500 shrink-0" />
                <h3
                  class="font-black text-gray-700 text-sm uppercase tracking-wider"
                >
                  UTILIDAD ANTES DE IMPUESTOS
                </h3>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                El resultado sobre el cual el Estado (SUNAT u organismo fiscal)
                te aplicará el cálculo de los impuestos correspondientes.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-lg font-black text-gray-700 leading-tight block"
                >{{ formatCurrency(totals.earningsBeforeTaxes) }}</span
              >
            </div>
          </div>
        </div>

        <!-- (-) Impuesto a la Renta -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 overflow-hidden"
        >
          <div
            class="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-gray-50/20 transition-colors"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-red-100 text-red-800 font-extrabold rounded text-[10px] sm:text-xs tracking-tight shrink-0"
                  >(-)</span
                >
                <Page class="w-5 h-5 text-orange-500 shrink-0" />
                <button
                  @click="toggleLineDetails('tax')"
                  class="font-extrabold text-gray-800 text-sm text-left hover:underline focus:outline-none"
                >
                  Impuesto a la Renta
                </button>
              </div>
              <p class="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                Tu contribución tributaria obligatoria sobre las utilidades
                reales que generó tu negocio en el período.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-base font-extrabold text-red-600 leading-tight block"
                >{{ formatCurrency(lines.tax) }}</span
              >
            </div>
          </div>

          <!-- Accordion de Transacciones -->
          <Transition name="expand">
            <div
              v-if="activeLineDetails === 'tax'"
              class="bg-gray-50/80 px-6 py-4 border-t border-b border-gray-100 space-y-3"
            >
              <h4
                class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
              >
                Desglose por Subcategorías
              </h4>
              <div
                v-if="lineTransactions.tax.length === 0"
                class="text-gray-400 italic text-xs"
              >
                No se registraron pagos de impuesto a la renta en este rango.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="sub in lineTransactions.tax"
                  :key="sub.key"
                  class="bg-white border border-gray-150 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <button
                        @click="toggleSubcategoryDetails('tax', sub.key)"
                        class="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold select-none transition-colors shrink-0"
                      >
                        {{
                          activeSubcategoryDetails["tax"] === sub.key
                            ? "−"
                            : "+"
                        }}
                      </button>
                      <span
                        class="font-bold text-gray-900 text-[11px] truncate"
                        >{{ sub.name }}</span
                      >
                    </div>
                    <span class="font-black text-gray-900 text-xs shrink-0">{{
                      formatCurrency(sub.amount)
                    }}</span>
                  </div>

                  <Transition name="expand">
                    <div
                      v-if="activeSubcategoryDetails['tax'] === sub.key"
                      class="pl-6 pt-2 border-t border-gray-50 space-y-1.5 max-h-[120px] overflow-y-auto pr-1"
                    >
                      <div
                        v-for="t in sub.txs"
                        :key="t.uuid"
                        class="flex justify-between text-[10px] text-gray-500 py-0.5 border-b border-gray-50"
                      >
                        <span class="truncate mr-2">{{ t.description }}</span>
                        <span class="font-bold text-gray-800 shrink-0">{{
                          formatCurrency(t.amount)
                        }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- (=) GANANCIA (UTILIDAD) NETA -->
        <div
          class="bg-gradient-to-br from-red-50/30 via-white to-red-50/10 rounded-2xl border-2 border-red-500 shadow-[0_4px_25px_rgba(239,68,68,0.18)] ring-4 ring-red-100 hover:ring-red-200 hover:border-red-600 transition-all duration-300 relative overflow-hidden"
        >
          <div class="px-6 py-5 flex items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-red-500 text-white font-extrabold rounded text-xs tracking-tight shrink-0"
                  >(=)</span
                >
                <BrightCrown
                  class="w-6 h-6 text-yellow-500 animate-pulse shrink-0"
                />
                <h3
                  class="font-black text-red-600 text-sm uppercase tracking-wider"
                >
                  GANANCIA (UTILIDAD) NETA
                </h3>
              </div>
              <p class="text-[11px] text-red-950 leading-relaxed max-w-2xl">
                <strong>¡El premio final!</strong> Este dinero ya no le debe
                nada a nadie. Es 100% de la empresa, listo para llevar a tu
                bolsillo (dividendos) o dejar guardado para reinvertir en
                insumos.
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                class="text-xl font-black text-red-600 leading-tight block"
                >{{ formatCurrency(totals.netProfit) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Pantalla Vacía si no hay transacciones -->
      <div
        v-else
        class="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-xs"
      >
        <span class="text-4xl block mb-3">📁</span>
        <h3
          class="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-1"
        >
          Sin movimientos registrados
        </h3>
        <p class="text-xs text-gray-500 max-w-md mx-auto">
          No se encontraron transacciones financieras registradas en el período
          seleccionado. Empieza registrando ventas y gastos en tu Dashboard.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useTransaccion } from "@/composables/useTransaction";
import { classifyStatementLine } from "@/utils/statementLineClassifier";
import { useInventoryStore } from "@/stores/inventoryStore";
import {
  GraphUp,
  GraphDown,
  Coins,
  Package,
  Megaphone,
  Settings,
  Safe,
  Page,
  BrightCrown,
  Reports,
} from "@iconoir/vue";

// composables
const { getTransactionsRange } = useTransaccion();
const inventoryStore = useInventoryStore();

// Estado
const isLoading = ref(true);
const transactions = ref([]);
const selectedRangeOption = ref("this_month");
const customStartDate = ref("");
const customEndDate = ref("");
const activeLineDetails = ref(null); // Línea del P&L activa para desglose
const activeSubcategoryDetails = ref({}); // { [lineKey]: subcategoryKey }

const rangeOptions = [
  { value: "this_month", label: "Este Mes" },
  { value: "last_month", label: "Mes Anterior" },
  { value: "last_30d", label: "Últimos 30 días" },
  { value: "custom", label: "Personalizado" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (createdAt) => {
  if (!createdAt) return "";
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
};

// Toggle de acordeones de desgloses de transacciones principales
const toggleLineDetails = (lineKey) => {
  if (activeLineDetails.value === lineKey) {
    activeLineDetails.value = null;
  } else {
    activeLineDetails.value = lineKey;
    activeSubcategoryDetails.value = {}; // Resetear sub-desplegables al cambiar de línea
  }
};

// Toggle de sub-acordeones de subcategorías
const toggleSubcategoryDetails = (lineKey, subcatKey) => {
  if (activeSubcategoryDetails.value[lineKey] === subcatKey) {
    activeSubcategoryDetails.value[lineKey] = null;
  } else {
    activeSubcategoryDetails.value[lineKey] = subcatKey;
  }
};

const hasData = computed(() => transactions.value.length > 0);

// Nombres legibles en español para subcategorías
const formatSubcategoryName = (subcat, category = "") => {
  if (!subcat) return "Otros conceptos";
  const names = {
    platform_commission: "Comisión de Plataformas (Rappi / PedidosYa)",
    delivery_cost: "Gastos de Envío / Delivery (WhatsApp Directo)",
    delivery_packaging_used: "Costo de Envases y Empaques (Pedidos)",
    Digital: "Publicidad Digital (Ads Meta / Google)",
    Físico: "Publicidad Física (Folletos / Volantes)",
    impuesto_renta: "Impuesto a la Renta (SUNAT)",
    depreciacion: "Reserva por Depreciación de Activos",
    "Banca y Cuentas": "Servicios Bancarios y Comisiones de Cuenta",
    POS: "Comisiones de Pasarela POS (Niubiz / IziPay / Yape)",
    cogs_materials: "Compras Físicas de Insumos y Telas",
    cogs_labor: "Mano de Obra Directa a Destajo (Confección)",
    cogs_cif: "Costos Indirectos de Producción (Servicios Taller)",
    mixed_overhead: "Gastos Mixtos Prorrateados (Luz / Local)",
    planilla_personal: "Planilla y Sueldos de Personal (Administración/Ventas)",
    servicios_publicos:
      "Servicios Públicos y Conectividad (Luz / Agua / Internet)",
    alquileres: "Alquileres de Local y Oficinas",
    mantenimiento_limpieza: "Mantenimiento, Seguridad y Limpieza",
  };

  if (names[subcat]) return names[subcat];

  // Traducir dinámicamente guiones y capitalizar
  return subcat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// Clasificación semántica/dinámica inteligente basada en descripción para subcategorías vacías
const getDynamicSubcategory = (tx) => {
  if (!tx) return "otros_conceptos";

  // Si tiene subcategoría o subsubcategoría bien definidos en base a la taxonomía
  const subcatVal = tx.subsubcategory || tx.subcategory;
  if (
    subcatVal &&
    subcatVal !== "otros_conceptos" &&
    subcatVal !== "Otros Conceptos" &&
    subcatVal !== ""
  ) {
    // Normalizar a los identificadores usados en el P&L
    if (subcatVal === "Servicios Públicos" || subcatVal === "servicios_publicos" || subcatVal === "Servicios Básicos") {
      return "servicios_publicos";
    }
    if (subcatVal === "Comunicaciones") {
      return "servicios_publicos";
    }
    if (subcatVal === "Administración" || subcatVal === "planilla_personal" || subcatVal === "Sueldos y Personal No Productivo") {
      return "planilla_personal";
    }
    if (subcatVal === "Alquileres" || subcatVal === "alquileres" || subcatVal === "Alquileres y Espacios No Productivos") {
      return "alquileres";
    }
    if (subcatVal === "Infraestructura" || subcatVal === "mantenimiento_limpieza" || subcatVal === "Mantenimiento General No Productivo") {
      return "mantenimiento_limpieza";
    }
    if (subcatVal === "Servicios de Limpieza" || subcatVal === "Insumos de Limpieza" || subcatVal === "Limpieza e Higiene No Productiva") {
      return "mantenimiento_limpieza";
    }
    return subcatVal;
  }

  const desc = (tx.description || "").toLowerCase().trim();

  // 1. Planilla / Sueldos / Personal
  if (
    desc.includes("sueldo") ||
    desc.includes("recepcionista") ||
    desc.includes("administrador") ||
    desc.includes("cocinero") ||
    desc.includes("planilla") ||
    desc.includes("personal") ||
    desc.includes("cajero") ||
    desc.includes("vendedor") ||
    desc.includes("honorarios") ||
    desc.includes("pago a") ||
    (desc.includes("pago de") &&
      (desc.includes("empleado") || desc.includes("trabajador")))
  ) {
    return "planilla_personal";
  }

  // 2. Servicios Públicos
  if (
    desc.includes("luz") ||
    desc.includes("agua") ||
    desc.includes("internet") ||
    desc.includes("electricidad") ||
    desc.includes("servicios") ||
    desc.includes("teléfono") ||
    desc.includes("telefono") ||
    desc.includes("gas") ||
    desc.includes("enel") ||
    desc.includes("sedapal") ||
    desc.includes("movistar") ||
    desc.includes("claro")
  ) {
    return "servicios_publicos";
  }

  // 3. Alquileres
  if (
    desc.includes("alquiler") ||
    desc.includes("renta") ||
    desc.includes("local") ||
    desc.includes("taller") ||
    desc.includes("alquileres")
  ) {
    return "alquileres";
  }

  // 4. Mantenimiento y Limpieza
  if (
    desc.includes("mantenimiento") ||
    desc.includes("reparación") ||
    desc.includes("reparacion") ||
    desc.includes("limpieza") ||
    desc.includes("pintura")
  ) {
    return "mantenimiento_limpieza";
  }

  return tx.subcategory || "otros_conceptos";
};

// ==========================================
// CÁLCULO DE REFERENCIAS INFORMATIVAS
// ==========================================

const comprasBrutasInsumos = computed(() => {
  return transactions.value
    .filter(
      (tx) =>
        tx.type === "expense" &&
        (tx.statementLine === "cogs_materials" ||
          classifyStatementLine(tx) === "cogs_materials"),
    )
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
});

// ==========================================
// CÁLCULO DEL ESTADO DE RESULTADOS (P&L)
// ==========================================

const lines = computed(() => {
  const statement = {
    sales_revenue: 0,
    cogs_materials: 0,
    cogs_labor: 0,
    cogs_cif: 0,
    opex_fixed: 0,
    opex_sales: 0,
    depreciation: 0,
    financial: 0,
    tax: 0,
  };

  // 1. Calcular Costo de Materiales, Mano de Obra y CIF basándose estrictamente en unidades vendidas
  let totalCogsMaterialsVendidos = 0;
  let totalCogsLaborVendido = 0;
  let totalCogsCifVendido = 0;

  transactions.value.forEach((tx) => {
    // Ingresos por ventas brutas
    if (tx.type === "income") {
      statement.sales_revenue += Number(tx.amount || 0);

      // Si la transacción tiene envases/empaques asociados para delivery/takeaway,
      // sumamos el costo de estos envases directamente a los Gastos de Ventas (opex_sales).
      if (tx.packagingCost) {
        statement.opex_sales += Number(tx.packagingCost);
      }

      // Calcular costos unitarios asociados si hay items vendidos
      if (Array.isArray(tx.items)) {
        tx.items.forEach((item) => {
          const productId =
            item.productId || item.selectedProductUuid || item.uuid;
          const quantity = Number(item.quantity || 0);
          if (!productId || !quantity) return;

          // Buscar el producto en el inventario para extraer su costStructure
          const product = inventoryStore.allItemsInInventory.value.find(
            (p) => p.uuid === productId || p.id === productId,
          );

          const unitMaterials = Number(
            product?.costStructure?.materials ??
              product?.cost ??
              item?.costPerUnit ??
              0,
          );
          const unitLabor = Number(product?.costStructure?.mod ?? 0);
          const unitCif = Number(product?.costStructure?.cif ?? 0);

          totalCogsMaterialsVendidos += unitMaterials * quantity;
          totalCogsLaborVendido += unitLabor * quantity;
          totalCogsCifVendido += unitCif * quantity;
        });
      }
    } else if (tx.type === "expense") {
      // Gastos y egresos operativos, fijos, de ventas, financieros, depreciación e impuestos
      const lineKey = tx.statementLine || classifyStatementLine(tx);
      const amount = Number(tx.amount || 0);

      if (lineKey === "mixed" && Array.isArray(tx.splits)) {
        // Gastos mixtos prorrateados
        tx.splits.forEach((split) => {
          if (split.bucket === "MANUFACTURING_OH") {
            statement.cogs_cif += Number(split.amount || 0);
          } else if (split.bucket === "OVERHEAD") {
            statement.opex_fixed += Number(split.amount || 0);
          }
        });
      } else if (
        lineKey === "cogs_materials" ||
        lineKey === "cogs_labor" ||
        lineKey === "cogs_cif"
      ) {
        // Ignoramos la suma de egresos brutos en el cálculo final del P&L para estos tres
        // puesto que ya se calculan arriba de forma rigurosa y devengada basándose en las ventas.
        // Solo sumamos a statement si no se detectaron ventas, para evitar un P&L en cero si el usuario no usa el catálogo.
      } else if (statement[lineKey] !== undefined) {
        statement[lineKey] += amount;
      }
    }
  });

  // Si no se detectó ninguna venta de productos costeados en el catálogo (por ejemplo, el usuario registra ingresos genéricos),
  // como fallback tomamos los egresos de producción en caliente del mes para que el P&L no se quede irrealmente en cero costeos.
  if (totalCogsMaterialsVendidos === 0) {
    let comprasFisicasInsumos = 0;
    let egresosLaborFisicos = 0;
    let egresosCifFisicos = 0;

    transactions.value.forEach((tx) => {
      if (tx.type === "expense") {
        const lineKey = tx.statementLine || classifyStatementLine(tx);
        const amount = Number(tx.amount || 0);
        if (lineKey === "cogs_materials") {
          comprasFisicasInsumos += amount;
        } else if (lineKey === "cogs_labor") {
          egresosLaborFisicos += amount;
        } else if (lineKey === "cogs_cif") {
          egresosCifFisicos += amount;
        }
      }
    });

    statement.cogs_materials = comprasFisicasInsumos;
    statement.cogs_labor = egresosLaborFisicos;
    statement.cogs_cif = egresosCifFisicos;
  } else {
    // 🔒 Devengado automatizado + incorporación de egresos reales del mes para sueldos de taller/producción y CIF real
    let realProductionLaborExpenses = 0;
    let realProductionCifExpenses = 0;

    transactions.value.forEach((tx) => {
      if (tx.type === "expense") {
        const lineKey = tx.statementLine || classifyStatementLine(tx);
        const amount = Number(tx.amount || 0);
        if (lineKey === "cogs_labor") {
          realProductionLaborExpenses += amount;
        } else if (lineKey === "cogs_cif") {
          realProductionCifExpenses += amount;
        }
      }
    });

    statement.cogs_materials = totalCogsMaterialsVendidos;
    statement.cogs_labor = totalCogsLaborVendido;
    // Sumamos estrictamente la planilla real de producción (ej: sueldo cocinero) y el CIF físico bajo Costos Indirectos de Producción, sin el CIF unitario del catálogo
    statement.cogs_cif =
      realProductionLaborExpenses + realProductionCifExpenses;
  }

  return statement;
});

// Cálculos de Totales y Márgenes Intermedios
const totals = computed(() => {
  const totalCogs =
    lines.value.cogs_materials + lines.value.cogs_labor + lines.value.cogs_cif;
  const grossProfit = Math.max(0, lines.value.sales_revenue - totalCogs);

  const totalOpex =
    lines.value.opex_fixed + lines.value.opex_sales + lines.value.depreciation;
  const operatingProfit = Math.max(0, grossProfit - totalOpex);

  const earningsBeforeTaxes = Math.max(
    0,
    operatingProfit - lines.value.financial,
  );
  const netProfit = Math.max(0, earningsBeforeTaxes - lines.value.tax);

  return {
    totalCogs,
    grossProfit,
    totalOpex,
    operatingProfit,
    earningsBeforeTaxes,
    netProfit,
  };
});

// Insights / Diagnóstico Estratégico
const grossMarginPct = computed(() => {
  if (!lines.value.sales_revenue) return 0;
  return (totals.value.grossProfit / lines.value.sales_revenue) * 100;
});

const deliveryToProfitPct = computed(() => {
  if (!totals.value.netProfit) return 0;
  return (lines.value.opex_sales / totals.value.netProfit) * 100;
});

// Agrupación de transacciones individuales por su línea contable para desgloses
const lineTransactions = computed(() => {
  const result = {
    sales_revenue: [],
    cogs: [],
    opex_fixed: [],
    opex_sales: [],
    depreciation: [],
    financial: [],
    tax: [],
  };

  // --- 1. AGRUPACIÓN DE VENTAS TOTALES (sales_revenue) ---
  const salesMap = new Map();
  let ventasGeneralesAmount = 0;
  const generalSalesTxs = [];

  transactions.value.forEach((tx) => {
    if (tx.type === "income") {
      if (Array.isArray(tx.items) && tx.items.length > 0) {
        tx.items.forEach((item) => {
          const productId =
            item.productId || item.selectedProductUuid || item.uuid;
          const key = productId || item.description || "general";
          const quantity = Number(item.quantity || 0);
          const price = Number(item.price || 0);
          const subtotal = price * quantity;

          if (salesMap.has(key)) {
            const existing = salesMap.get(key);
            existing.quantity += quantity;
            existing.amount += subtotal;
          } else {
            salesMap.set(key, {
              description: item.description || "Venta de catálogo",
              quantity,
              amount: subtotal,
            });
          }
        });
      } else {
        // Ingreso sin items detallados (Ventas Generales)
        ventasGeneralesAmount += Number(tx.amount || 0);
        generalSalesTxs.push({
          uuid: tx.uuid,
          description: tx.description || "Venta rápida / genérica",
          amount: Number(tx.amount || 0),
          createdAt: tx.createdAt,
        });
      }
    }
  });

  const catalogSalesTxs = [];
  salesMap.forEach((val) => {
    catalogSalesTxs.push({
      uuid: Math.random().toString(),
      description: `${val.description} (Catálogo)`,
      amount: val.amount,
      detail: `Unidades vendidas: ${val.quantity} unidades | Promedio: ${formatCurrency(val.amount / val.quantity)} c/u`,
    });
  });

  // Agrupar en subcategorías de sales_revenue
  if (catalogSalesTxs.length > 0) {
    result.sales_revenue.push({
      key: "catalog_sales",
      name: "Ventas por Producto (Catálogo)",
      amount: catalogSalesTxs.reduce((sum, t) => sum + t.amount, 0),
      txs: catalogSalesTxs.sort((a, b) => b.amount - a.amount),
    });
  }
  if (generalSalesTxs.length > 0) {
    result.sales_revenue.push({
      key: "general_sales",
      name: "Ventas Generales (Caja Rápida / Sin Detalle)",
      amount: ventasGeneralesAmount,
      txs: generalSalesTxs
        .map((tx) => ({
          uuid: tx.uuid,
          description: `${formatDate(tx.createdAt)} - ${tx.description}`,
          amount: tx.amount,
        }))
        .sort((a, b) => b.amount - a.amount),
    });
  }

  // --- 2. AGRUPACIÓN DE COSTOS DE VENTAS (cogs) ---
  const cogsMap = new Map();
  let totalCogsMaterialsVendidos = 0;

  transactions.value.forEach((tx) => {
    if (tx.type === "income" && Array.isArray(tx.items)) {
      tx.items.forEach((item) => {
        const productId =
          item.productId || item.selectedProductUuid || item.uuid;
        const quantity = Number(item.quantity || 0);
        if (!productId || !quantity) return;

        const product = inventoryStore.allItemsInInventory.value.find(
          (p) => p.uuid === productId || p.id === productId,
        );

        const unitMaterials = Number(
          product?.costStructure?.materials ??
            product?.cost ??
            item?.costPerUnit ??
            0,
        );
        const unitLabor = Number(product?.costStructure?.mod ?? 0);
        const unitCif = Number(product?.costStructure?.cif ?? 0);

        const totalMatCost = unitMaterials * quantity;
        const totalLabCost = unitLabor * quantity;
        const totalCifCost = unitCif * quantity;

        totalCogsMaterialsVendidos += totalMatCost;

        if (totalMatCost > 0 || totalLabCost > 0 || totalCifCost > 0) {
          const key = `${productId}_${item.description || "Producto"}`;
          if (cogsMap.has(key)) {
            const existing = cogsMap.get(key);
            existing.quantity += quantity;
            existing.totalMatCost += totalMatCost;
            existing.totalLabCost += totalLabCost;
            existing.totalCifCost += totalCifCost;
          } else {
            cogsMap.set(key, {
              description: item.description || "Producto sin nombre",
              quantity,
              unitMaterials,
              unitLabor,
              unitCif,
              totalMatCost,
              totalLabCost,
              totalCifCost,
            });
          }
        }
      });
    }
  });

  const isFallback = totalCogsMaterialsVendidos === 0;

  // Generar txs para cogs_materials
  const materialsTxs = [];
  if (!isFallback) {
    cogsMap.forEach((val, key) => {
      if (val.totalMatCost > 0) {
        materialsTxs.push({
          uuid: `${key}_mat`,
          description: val.description,
          amount: val.totalMatCost,
          detail: `Consumo: ${val.quantity} unidades x ${formatCurrency(val.unitMaterials)} c/u de insumos`,
        });
      }
    });
  } else {
    transactions.value.forEach((tx) => {
      if (tx.type === "expense") {
        const lineKey = tx.statementLine || classifyStatementLine(tx);
        if (lineKey === "cogs_materials") {
          materialsTxs.push({
            uuid: tx.uuid,
            description: `${formatDate(tx.createdAt)} - ${tx.description}`,
            amount: Number(tx.amount || 0),
          });
        }
      }
    });
  }

  // Generar txs para cogs_labor
  const laborTxs = [];
  if (!isFallback) {
    cogsMap.forEach((val, key) => {
      if (val.totalLabCost > 0) {
        laborTxs.push({
          uuid: `${key}_lab`,
          description: val.description,
          amount: val.totalLabCost,
          detail: `Consumo: ${val.quantity} unidades x ${formatCurrency(val.unitLabor)} c/u destajo MOD`,
        });
      }
    });
  } else {
    transactions.value.forEach((tx) => {
      if (tx.type === "expense") {
        const lineKey = tx.statementLine || classifyStatementLine(tx);
        if (lineKey === "cogs_labor") {
          laborTxs.push({
            uuid: tx.uuid,
            description: `${formatDate(tx.createdAt)} - ${tx.description}`,
            amount: Number(tx.amount || 0),
          });
        }
      }
    });
  }

  // Generar txs para cogs_cif (solo planillas de producción y CIF real registradas como egreso)
  const cifTxs = [];
  if (!isFallback) {
    // Agregar egresos reales de mano de obra de producción (como el sueldo del cocinero) y CIF real de egresos
    transactions.value.forEach((tx) => {
      if (tx.type === "expense") {
        const lineKey = tx.statementLine || classifyStatementLine(tx);
        const amount = Number(tx.amount || 0);
        if (lineKey === "cogs_labor") {
          cifTxs.push({
            uuid: tx.uuid,
            description: `${formatDate(tx.createdAt)} - Personal de Producción: ${tx.description}`,
            amount: amount,
            detail:
              "Egresos directos por planilla de producción (sueldo fijo/cocinero)",
          });
        } else if (lineKey === "cogs_cif") {
          cifTxs.push({
            uuid: tx.uuid,
            description: `${formatDate(tx.createdAt)} - ${tx.description}`,
            amount: amount,
            detail: "Costos indirectos de producción de taller registrados",
          });
        } else if (lineKey === "mixed" && Array.isArray(tx.splits)) {
          tx.splits.forEach((split) => {
            if (split.bucket === "MANUFACTURING_OH") {
              cifTxs.push({
                uuid: `${tx.uuid}_cif_split`,
                description: `${formatDate(tx.createdAt)} - Prorrateo: ${tx.description}`,
                amount: Number(split.amount || 0),
                detail: "Costos indirectos de taller (prorrateados)",
              });
            }
          });
        }
      }
    });
  } else {
    transactions.value.forEach((tx) => {
      if (tx.type === "expense") {
        const lineKey = tx.statementLine || classifyStatementLine(tx);
        if (lineKey === "cogs_cif") {
          cifTxs.push({
            uuid: tx.uuid,
            description: `${formatDate(tx.createdAt)} - ${tx.description}`,
            amount: Number(tx.amount || 0),
          });
        } else if (lineKey === "mixed" && Array.isArray(tx.splits)) {
          tx.splits.forEach((split) => {
            if (split.bucket === "MANUFACTURING_OH") {
              cifTxs.push({
                uuid: `${tx.uuid}_cif_split`,
                description: `${formatDate(tx.createdAt)} - Prorrateo: ${tx.description}`,
                amount: Number(split.amount || 0),
              });
            }
          });
        }
      }
    });
  }

  // Agrupar en subcategorías de cogs
  result.cogs = [
    {
      key: "cogs_materials",
      name: "Insumos y Materiales de lo Vendido",
      amount: lines.value.cogs_materials,
      txs: materialsTxs.sort((a, b) => b.amount - a.amount),
    },
    {
      key: "cogs_labor",
      name: "Mano de Obra Directa (Destajo)",
      amount: lines.value.cogs_labor,
      txs: laborTxs.sort((a, b) => b.amount - a.amount),
    },
    {
      key: "cogs_cif",
      name: "Costos Indirectos de Producción (CIF)",
      amount: lines.value.cogs_cif,
      txs: cifTxs.sort((a, b) => b.amount - a.amount),
    },
  ];

  // --- 3. AGRUPACIÓN DE EGRESOS POR SUBCATEGORÍA (Doble Nivel Jerárquico) ---
  const groupExpenseBySubcategory = (txList) => {
    const subcatGroups = {}; // { [subcatKey]: { key, name, amount, txs: [] } }

    txList.forEach((tx) => {
      const subcat = getDynamicSubcategory(tx);
      const amount = Number(tx.amount || 0);

      if (!subcatGroups[subcat]) {
        subcatGroups[subcat] = {
          key: subcat,
          name: formatSubcategoryName(subcat, tx.category),
          amount: 0,
          txs: [],
        };
      }

      subcatGroups[subcat].amount += amount;
      subcatGroups[subcat].txs.push(tx);
    });

    // Convertir a lista y ordenar por monto desc
    return Object.values(subcatGroups).sort((a, b) => b.amount - a.amount);
  };

  // Agrupar egresos individuales por su statementLine
  const opexFixedTxs = [];
  const opexSalesTxs = [];
  const depreciationTxs = [];
  const financialTxs = [];
  const taxTxs = [];

  transactions.value.forEach((tx) => {
    if (tx.type === "expense") {
      const lineKey = tx.statementLine || classifyStatementLine(tx);

      if (lineKey === "mixed" && Array.isArray(tx.splits)) {
        tx.splits.forEach((split) => {
          const splitCopy = { ...tx, amount: split.amount };
          if (split.bucket === "MANUFACTURING_OH") {
            splitCopy.category = "materials/CIF (prorrateo)";
            if (cogsMap.size === 0) {
              // Si no hay productos del catálogo, cae en fallback en cogs
            }
          } else if (split.bucket === "OVERHEAD") {
            splitCopy.subcategory = "mixed_overhead";
            opexFixedTxs.push(splitCopy);
          }
        });
      } else if (
        lineKey === "cogs_materials" ||
        lineKey === "cogs_labor" ||
        lineKey === "cogs_cif"
      ) {
        // En cogs de fallback (si no hay catálogo)
        if (cogsMap.size === 0) {
          // Dejar en listado de cogs
        }
      } else if (lineKey === "opex_fixed") {
        opexFixedTxs.push(tx);
      } else if (lineKey === "opex_sales") {
        opexSalesTxs.push(tx);
      } else if (lineKey === "depreciation") {
        depreciationTxs.push(tx);
      } else if (lineKey === "financial") {
        financialTxs.push(tx);
      } else if (lineKey === "tax") {
        taxTxs.push(tx);
      }
    } else if (tx.type === "income" && tx.packagingCost > 0) {
      // Agregar costo de envases virtuales a los gastos de ventas
      opexSalesTxs.push({
        uuid: `${tx.uuid}_pkg`,
        description: `Envases: ${tx.description || "Pedido Delivery"}`,
        subcategory: "delivery_packaging_used",
        amount: tx.packagingCost,
        createdAt: tx.createdAt,
      });
    }
  });

  // Agrupar
  result.opex_fixed = groupExpenseBySubcategory(opexFixedTxs);
  result.opex_sales = groupExpenseBySubcategory(opexSalesTxs);
  result.depreciation = groupExpenseBySubcategory(depreciationTxs);
  result.financial = groupExpenseBySubcategory(financialTxs);
  result.tax = groupExpenseBySubcategory(taxTxs);

  return result;
});

// ==========================================
// CARGA Y RANGO DE FECHAS
// ==========================================

const selectRangeOption = (value) => {
  selectedRangeOption.value = value;
  calculateDates();
};

const calculateDates = () => {
  const today = new Date();
  let start, end;

  if (selectedRangeOption.value === "this_month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  } else if (selectedRangeOption.value === "last_month") {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
  } else if (selectedRangeOption.value === "last_30d") {
    start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  }

  if (selectedRangeOption.value !== "custom") {
    customStartDate.value = start.toISOString().split("T")[0];
    customEndDate.value = end.toISOString().split("T")[0];
  }
};

const fetchTransactionsData = async () => {
  if (!customStartDate.value || !customEndDate.value) return;

  try {
    isLoading.value = true;
    const start = new Date(customStartDate.value + "T00:00:00");
    const end = new Date(customEndDate.value + "T23:59:59.999");

    const [result] = await Promise.all([
      getTransactionsRange(start, end),
      inventoryStore.getItemsInInventory(),
    ]);
    transactions.value = result || [];
    console.log(
      `✅ ${transactions.value.length} transacciones cargadas para P&L y ${inventoryStore.allItemsInInventory.value.length} productos del inventario.`,
    );
  } catch (error) {
    console.error("❌ Error cargando transacciones para P&L:", error);
    transactions.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Observar rangos para recargar
watch(selectedRangeOption, () => {
  if (selectedRangeOption.value !== "custom") {
    fetchTransactionsData();
  }
});

watch([customStartDate, customEndDate], () => {
  fetchTransactionsData();
});

onMounted(() => {
  calculateDates();
  fetchTransactionsData();
});
</script>

<style scoped>
/* Animaciones de expansión de acordeón */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 400px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
