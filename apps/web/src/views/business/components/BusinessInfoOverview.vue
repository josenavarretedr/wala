<template>
  <div class="space-y-2">
    <section
      v-for="section in businessSections"
      :key="section.id"
      class="py-5 border-b border-gray-100 last:border-b-0"
    >
      <div class="flex items-start gap-3 mb-4">
        <div
          class="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center"
        >
          <component :is="section.icon" class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">
            {{ section.title }}
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ section.description }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="field in section.fields" :key="field.id">
          <label class="block text-sm font-medium text-gray-900 mb-2">
            {{ field.title }}
          </label>

          <select
            v-if="field.type === 'options'"
            v-model="modelValue[field.key]"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
          >
            <option value="">Seleccione una opción</option>
            <option
              v-for="option in field.options"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>

          <input
            v-else
            v-model="modelValue[field.key]"
            type="text"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
          />

          <p v-if="field.description" class="mt-1 text-xs text-gray-500">
            {{ field.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Sección 4: Parámetros de Gestión Financiera (Método WALA) -->
    <section class="py-5 border-b border-gray-100">
      <div class="flex items-start gap-3 mb-4">
        <div
          class="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0"
        >
          <Wallet class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-semibold text-gray-900">
              Parámetros de Gestión Financiera
            </h3>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              Método WALA
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">
            Configuración usada para tu sueldo del dueño, costeo por hora, compras y seguimiento del plan de acción
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Meta mensual personal -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Meta de ingreso personal mensual (S/)
          </label>
          <input
            v-model.number="modelValue.ownerSalaryTarget"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej: 1500.00"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
          />
          <p class="mt-1 text-xs text-gray-500">
            Monto mensual que necesitas recibir de tu negocio para cubrir tu presupuesto familiar
          </p>
        </div>

        <!-- Sueldo fijo asignado -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Sueldo fijo del dueño asignado (S/)
          </label>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model.number="modelValue.ownerSalaryAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 350.00"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
            />
            <select
              v-model="modelValue.ownerSalaryFrequency"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
            >
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Se pre-llenará automáticamente cuando registres el gasto «Salario del dueño»
          </p>
        </div>

        <!-- Horas semanales del dueño -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Horas semanales trabajadas por el dueño
          </label>
          <input
            v-model.number="modelValue.ownerWeeklyHours"
            type="number"
            step="1"
            min="1"
            max="120"
            placeholder="Ej: 48"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
          />
          <p class="mt-1 text-xs text-gray-500">
            Jornada habitual que dedicas al negocio cada semana (ej. 48 h)
          </p>
        </div>

        <!-- Valor hora del dueño -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-900">
              Valor por hora del dueño (S/ / hr)
            </label>
            <button
              v-if="suggestedHourlyRate > 0"
              type="button"
              @click="applySuggestedHourlyRate"
              class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              Calcular (S/ {{ suggestedHourlyRate.toFixed(2) }}/hr)
            </button>
          </div>
          <input
            v-model.number="modelValue.ownerHourlyRate"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej: 8.50"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
          />
          <p class="mt-1 text-xs text-gray-500">
            Se conecta con el costeo de Mano de Obra Directa (MOD) de tus productos
          </p>
        </div>

        <!-- Canal principal de promoción -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Canal principal de promoción
          </label>
          <select
            v-model="modelValue.primaryPromoChannel"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
          >
            <option value="">Seleccione un canal</option>
            <option value="WhatsApp">WhatsApp / Catálogo</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Recomendación">Recomendación / Boca a boca</option>
            <option value="Punto de venta">Punto de venta físico / Volantes</option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            Canal prioritario donde concentras tus promociones (Área Marketing)
          </p>
        </div>

        <!-- Umbral mínimo de compra para pedir 2 cotizaciones -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Pedir 2+ cotizaciones en compras desde (S/)
          </label>
          <input
            v-model.number="modelValue.purchaseQuoteThreshold"
            type="number"
            step="1"
            min="0"
            placeholder="Ej: 200.00"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
          />
          <p class="mt-1 text-xs text-gray-500">
            Regla de compras: monto a partir del cual siempre comparas proveedores (Área Compras)
          </p>
        </div>

        <!-- Meta principal del ciclo -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Meta principal del ciclo actual
          </label>
          <input
            v-model="modelValue.cycleMainGoal"
            type="text"
            placeholder="Ej: Aumentar margen bruto al 35% y mantener 5 productos clave sin quiebres de stock"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
          />
          <p class="mt-1 text-xs text-gray-500">
            Objetivo medible definido junto con tu asesor para el ciclo actual (Área Planificación)
          </p>
        </div>
      </div>
    </section>

    <section class="pt-5">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">
        Información del sistema
      </h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between py-2 border-b border-gray-100">
          <span class="text-gray-600">ID del negocio</span>
          <span class="font-mono text-gray-900">{{ businessId }}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-100">
          <span class="text-gray-600">Fecha de creación</span>
          <span class="text-gray-900">{{ formattedDate }}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-gray-600">Estado</span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            Activo
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ProfileCircle, Community, GraphUp, Wallet } from "@iconoir/vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  businessId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: [Object, String, Date],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const suggestedHourlyRate = computed(() => {
  const amt = Number(props.modelValue?.ownerSalaryAmount || 0);
  const hrs = Number(props.modelValue?.ownerWeeklyHours || 0);
  if (!(amt > 0) || !(hrs > 0)) return 0;
  let weeklyEq = amt;
  if (props.modelValue?.ownerSalaryFrequency === "biweekly") {
    weeklyEq = amt / 2;
  } else if (props.modelValue?.ownerSalaryFrequency === "monthly") {
    weeklyEq = amt / 4.33;
  }
  return Math.round(((weeklyEq / hrs) + Number.EPSILON) * 100) / 100;
});

const applySuggestedHourlyRate = () => {
  if (suggestedHourlyRate.value > 0) {
    props.modelValue.ownerHourlyRate = suggestedHourlyRate.value;
  }
};

const businessFields = [
  {
    id: "field_nombre_negocio",
    key: "nombreNegocio",
    type: "text",
    title: "Nombre del negocio",
    description: "",
  },
  {
    id: "field_anio_inicio",
    key: "anioInicio",
    type: "text",
    title: "Año en que empezó este negocio",
    description: "",
  },
  {
    id: "field_direccion_negocio",
    key: "direccionNegocio",
    type: "text",
    title: "Dirección del negocio",
    description: "Dirección física donde opera",
  },
  {
    id: "field_codigo_postal",
    key: "codigoPostal",
    type: "text",
    title: "Código Postal",
    description: "",
  },
  {
    id: "field_telefono_negocio",
    key: "telefonoNegocio",
    type: "text",
    title: "Teléfono del negocio",
    description: "",
  },
  {
    id: "field_departamento",
    key: "departamento",
    type: "text",
    title: "Departamento",
    description: "",
  },
  {
    id: "field_linea_negocio",
    key: "lineaNegocio",
    type: "options",
    title: "Línea de negocios",
    description: "Seleccione la línea principal del negocio",
    options: ["Comercio", "Producción", "Servicios"],
  },
  {
    id: "field_descripcion_sector",
    key: "descripcionSector",
    type: "text",
    title: "Descripción del sector / idea de negocio",
    description:
      "Describa brevemente el sector del negocio y/o la idea de negocio del empresari@",
  },
  {
    id: "field_forma_legal",
    key: "formaLegal",
    type: "options",
    title: "Forma legal del negocio",
    description: "",
    options: ["Unipersonal", "Sociedad Comercial", "Cooperativa", "Otra"],
  },
  {
    id: "field_posicion_negocio",
    key: "posicionNegocio",
    type: "options",
    title: "Posición en el negocio",
    description: "",
    options: ["Dueño(a)", "Gerente(a)", "Otro"],
  },
  {
    id: "field_experiencia",
    key: "experiencia",
    type: "options",
    title: "Años de experiencia gestionando éste u otro negocio",
    description: "",
    options: ["Ninguno", "Menos de un año", "1-3 años", "4 años o más"],
  },
  {
    id: "field_oportunidades_mercado",
    key: "oportunidadesMercado",
    type: "text",
    title: "Oportunidades de mercado",
    description:
      "Describa brevemente las oportunidades de mercado de su negocio",
  },
  {
    id: "field_calidad_oportunidades",
    key: "calidadOportunidades",
    type: "options",
    title: "¿Tiene el negocio oportunidades de mercado?",
    description: "",
    options: ["Excelentes", "Buenas", "Regulares"],
  },
  {
    id: "field_num_trabajadores",
    key: "numTrabajadores",
    type: "options",
    title: "Número de trabajadores",
    description: "",
    options: [
      "Trabajador / Propietari@",
      "2-5 trabajadores",
      "6-10 trabajadores",
      "11 o más trabajadores",
    ],
  },
  {
    id: "field_localizacion_permanente",
    key: "localizacionPermanente",
    type: "options",
    title: "¿Tiene una localización permanente donde opera su negocio?",
    description: "",
    options: ["Sí", "No"],
  },
  {
    id: "field_capital_invertido",
    key: "capitalInvertido",
    type: "options",
    title: "¿Ha invertido capital privado en este negocio?",
    description: "",
    options: ["Un poco", "Mucho"],
  },
  {
    id: "field_planes_largo_plazo",
    key: "planesLargoPlazo",
    type: "options",
    title: "¿Tiene planes de quedarse en el negocio por largo tiempo?",
    description: "",
    options: ["Sí", "No necesariamente"],
  },
];

const businessSections = [
  {
    id: "datos_generales",
    title: "Datos generales",
    description: "Identificación y ubicación del negocio",
    icon: ProfileCircle,
    fields: businessFields.filter((field) =>
      [
        "field_nombre_negocio",
        "field_anio_inicio",
        "field_direccion_negocio",
        "field_codigo_postal",
        "field_telefono_negocio",
        "field_departamento",
      ].includes(field.id),
    ),
  },
  {
    id: "perfil_negocio",
    title: "Perfil del negocio",
    description: "Actividad principal y estructura legal",
    icon: Community,
    fields: businessFields.filter((field) =>
      [
        "field_linea_negocio",
        "field_descripcion_sector",
        "field_forma_legal",
        "field_posicion_negocio",
        "field_experiencia",
      ].includes(field.id),
    ),
  },
  {
    id: "proyeccion",
    title: "Mercado y proyección",
    description: "Oportunidades, tamaño y continuidad",
    icon: GraphUp,
    fields: businessFields.filter((field) =>
      [
        "field_oportunidades_mercado",
        "field_calidad_oportunidades",
        "field_num_trabajadores",
        "field_localizacion_permanente",
        "field_capital_invertido",
        "field_planes_largo_plazo",
      ].includes(field.id),
    ),
  },
];

const formattedDate = computed(() => {
  if (!props.createdAt) return "No disponible";
  try {
    let dateObj;
    if (props.createdAt && props.createdAt.seconds) {
      dateObj = new Date(props.createdAt.seconds * 1000);
    } else if (props.createdAt) {
      dateObj = new Date(props.createdAt);
    } else {
      return "No disponible";
    }
    return dateObj.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
});
</script>
