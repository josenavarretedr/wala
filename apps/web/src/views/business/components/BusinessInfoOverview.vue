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
import { ProfileCircle, Community, GraphUp } from "@iconoir/vue";

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
