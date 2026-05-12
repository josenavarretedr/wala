<template>
  <div class="space-y-8">
    <!-- Clasificación Operativa -->
    <section class="pb-6 border-b border-gray-100">
      <div class="flex items-start gap-3 mb-6">
        <div class="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Community class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Clasificación operativa</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Determina cómo se procesan y clasifican automáticamente tus transacciones
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Rubro / Industry -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-3">Rubro de negocio (Productos/Servicios)</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="ind in industryOptions"
              :key="ind.id"
              type="button"
              @click="modelValue.industry = ind.id"
              :class="[
                'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center',
                modelValue.industry === ind.id
                  ? `border-${ind.color}-500 bg-${ind.color}-50 text-${ind.color}-700 shadow-sm`
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
              ]"
            >
              <div :class="[
                'p-2 rounded-full',
                modelValue.industry === ind.id ? `bg-${ind.color}-100` : 'bg-gray-100'
              ]">
                <component :is="ind.icon" class="w-5 h-5" />
              </div>
              <span class="text-xs font-medium">{{ ind.label }}</span>
            </button>
          </div>
        </div>

        <!-- Modelo de Actividad / businessType -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-3">Modelo de actividad económica</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="type in businessTypeOptions"
              :key="type.id"
              type="button"
              @click="modelValue.businessType = type.id"
              :class="[
                'p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left',
                modelValue.businessType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700 shadow-sm`
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
              ]"
            >
              <div :class="[
                'p-2 rounded-full shrink-0',
                modelValue.businessType === type.id ? `bg-${type.color}-100` : 'bg-gray-100'
              ]">
                <component :is="type.icon" class="w-5 h-5" />
              </div>
              <div>
                <span class="text-sm font-semibold block">{{ type.label }}</span>
                <span class="text-xs opacity-80">{{ type.desc }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Moneda y Región -->
    <section class="pb-6 border-b border-gray-100">
      <div class="flex items-start gap-3 mb-6">
        <div class="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Globe class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Moneda y Región</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Configuración regional y formato de divisa
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">Moneda principal</label>
          <select
            v-model="modelValue.moneda"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="PEN">Sol Peruano (PEN)</option>
            <option value="USD">Dólar Estadounidense (USD)</option>
            <option value="COP">Peso Colombiano (COP)</option>
            <option value="MXN">Peso Mexicanano (MXN)</option>
            <option value="CLP">Peso Chileno (CLP)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">País</label>
          <select
            v-model="modelValue.country"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="PE">Perú</option>
            <option value="CO">Colombia</option>
            <option value="MX">México</option>
            <option value="CL">Chile</option>
            <option value="US">Estados Unidos</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Horario de Atención -->
    <section class="pb-6 border-b border-gray-100">
      <div class="flex items-start gap-3 mb-6">
        <div class="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
          <Clock class="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Horario de Atención</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Define los días y horas de operación de tu negocio
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="day in daysOfWeek" :key="day.key" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div class="flex items-center gap-3 w-32">
            <input 
              type="checkbox" 
              v-model="modelValue.workingHours[day.key].isOpen"
              class="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <span class="text-sm font-medium text-gray-700">{{ day.label }}</span>
          </div>
          
          <div class="flex items-center gap-2" :class="{ 'opacity-50 pointer-events-none': !modelValue.workingHours[day.key].isOpen }">
            <input 
              type="time" 
              v-model="modelValue.workingHours[day.key].open"
              class="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
            />
            <span class="text-gray-400">-</span>
            <input 
              type="time" 
              v-model="modelValue.workingHours[day.key].close"
              class="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Notificaciones -->
    <section>
      <div class="flex items-start gap-3 mb-6">
        <div class="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
          <Bell class="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Notificaciones</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Configura qué alertas deseas recibir
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <label class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <span class="text-sm font-medium text-gray-900 block">Notificaciones por Email</span>
            <span class="text-xs text-gray-500">Recibe resúmenes y alertas importantes en tu correo</span>
          </div>
          <input type="checkbox" v-model="modelValue.notifications.email" class="w-5 h-5 text-blue-600 rounded border-gray-300" />
        </label>
        
        <label class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <span class="text-sm font-medium text-gray-900 block">Reporte Diario</span>
            <span class="text-xs text-gray-500">Un resumen de las operaciones de cada día</span>
          </div>
          <input type="checkbox" v-model="modelValue.notifications.dailyReport" class="w-5 h-5 text-blue-600 rounded border-gray-300" />
        </label>

        <label class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <span class="text-sm font-medium text-gray-900 block">Alertas de Stock Bajo</span>
            <span class="text-xs text-gray-500">Aviso cuando tus productos estén por agotarse</span>
          </div>
          <input type="checkbox" v-model="modelValue.notifications.lowStock" class="w-5 h-5 text-blue-600 rounded border-gray-300" />
        </label>
      </div>
    </section>

  </div>
</template>

<script setup>
import { Community, Globe, Clock, Bell, Wrench, Shop, Book, PizzaSlice, HalfMoon, Suggestion, ShoppingBag, Calendar, WashingMachine, ViewGrid } from "@iconoir/vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(["update:modelValue"]);

const daysOfWeek = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const industryOptions = [
  { id: 'ferreteria', label: 'Ferretería', color: 'red', icon: Wrench },
  { id: 'reposteria', label: 'Repostería', color: 'pink', icon: Shop },
  { id: 'libreria', label: 'Librería', color: 'indigo', icon: Book },
  { id: 'restaurante', label: 'Restaurante', color: 'yellow', icon: PizzaSlice },
  { id: 'farmacia', label: 'Farmacia', color: 'teal', icon: HalfMoon },
  { id: 'otro', label: 'Otro', color: 'purple', icon: Suggestion }
];

const businessTypeOptions = [
  { id: 'FOOD_PRODUCTION', label: 'Prod. Alimentos', desc: 'Elaboración y transformación', color: 'yellow', icon: PizzaSlice },
  { id: 'RETAIL', label: 'Minorista', desc: 'Venta de productos al por menor', color: 'orange', icon: ShoppingBag },
  { id: 'APPOINTMENT_SERVICES', label: 'Servicios con cita', desc: 'Profesionales y turnos', color: 'indigo', icon: Calendar },
  { id: 'MACHINE_SERVICES', label: 'Serv. con maquinaria', desc: 'Operaciones mecánicas', color: 'teal', icon: WashingMachine },
  { id: 'MIXED', label: 'Mixto', desc: 'Combinación de modelos', color: 'gray', icon: ViewGrid }
];

</script>
