<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Nueva Actividad</h1>
            <p class="text-sm text-gray-500">{{ programName }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- SECCIÓN 1: Info básica -->
      <div
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4"
      >
        <h2 class="text-base font-semibold text-gray-900">
          Información básica
        </h2>

        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700"
            >Nombre de la actividad <span class="text-red-500">*</span></label
          >
          <input
            v-model="form.title"
            type="text"
            placeholder="Ej: Registro de asistencia semanal"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700"
            >Descripción</label
          >
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe el propósito de esta actividad..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <!-- Tipo de actividad -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700"
            >Tipo de actividad <span class="text-red-500">*</span></label
          >
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="form.type = 'activity'"
              :class="[
                'p-4 rounded-xl border-2 text-left transition-all',
                form.type === 'activity'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <div class="text-xl mb-1">📋</div>
              <div class="text-sm font-semibold text-gray-900">Actividad</div>
              <div class="text-xs text-gray-500">
                Campos personalizados: texto, archivo, select, asistencia
              </div>
            </button>
            <button
              type="button"
              @click="form.type = 'consulting'"
              :class="[
                'p-4 rounded-xl border-2 text-left transition-all',
                form.type === 'consulting'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <div class="text-xl mb-1">🔍</div>
              <div class="text-sm font-semibold text-gray-900">Asesoría</div>
              <div class="text-xs text-gray-500">
                Diagnóstico empresarial con 21 preguntas
              </div>
            </button>
          </div>
        </div>

        <!-- Etapa (combobox) -->
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700">Etapa</label>
          <div class="relative" ref="stageDropdownRef">
            <input
              v-model="stageSearch"
              type="text"
              placeholder="Seleccionar o crear etapa..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              @focus="showStageDropdown = true"
              @input="handleStageInput"
              @keydown.enter.prevent
            />
            <!-- Badge etapa seleccionada -->
            <div
              v-if="form.stageId && !showStageDropdown"
              class="absolute inset-y-0 right-2 flex items-center"
            >
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full"
              >
                {{ selectedStageName }}
                <button
                  type="button"
                  @click.stop="clearStage"
                  class="hover:text-green-900"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </div>
            <!-- Dropdown -->
            <div
              v-if="showStageDropdown"
              class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <button
                v-for="stage in filteredStages"
                :key="stage.id"
                type="button"
                @click="selectStage(stage)"
                class="w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors"
                :class="
                  form.stageId === stage.id
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700'
                "
              >
                {{ stage.name }}
              </button>
              <button
                v-if="stageSearch.trim() && !exactStageMatch"
                type="button"
                @click="createAndSelectStage"
                :disabled="stageSaving"
                class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 border-t border-gray-100"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span v-if="stageSaving">Creando...</span>
                <span v-else>Crear "{{ stageSearch.trim() }}"</span>
              </button>
              <div
                v-if="!filteredStages.length && !stageSearch.trim()"
                class="px-3 py-3 text-xs text-gray-400 text-center"
              >
                No hay etapas. Escribe para crear una.
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-400">
            Opcional. Agrupa actividades por etapa.
          </p>
        </div>
      </div>

      <!-- SECCIÓN 2: Constructor de fields (solo form) -->
      <div
        v-if="form.type === 'activity'"
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">
            Campos de la actividad
            <span class="ml-1.5 text-xs font-normal text-gray-500"
              >({{ form.fields.length }} campos)</span
            >
          </h2>
          <button
            type="button"
            @click="openTemplatePicker"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Cargar template
          </button>
        </div>

        <!-- Lista de fields -->
        <div v-if="form.fields.length" class="space-y-2">
          <div
            v-for="(field, index) in form.fields"
            :key="field.id"
            class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
          >
            <!-- Badge tipo -->
            <span
              :class="[
                'shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-semibold',
                fieldTypeBadge(field.type),
              ]"
            >
              {{ fieldTypeLabel(field.type) }}
            </span>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ field.title }}
              </p>
              <p
                v-if="field.description"
                class="text-xs text-gray-500 truncate"
              >
                {{ field.description }}
              </p>
              <p
                v-if="
                  (field.type === 'select' || field.type === 'options') &&
                  field.options?.length
                "
                class="text-xs text-gray-400 mt-0.5"
              >
                Opciones: {{ field.options.join(", ") }}
              </p>
              <span
                v-if="field.required"
                class="inline-block mt-0.5 text-xs text-red-500"
                >Requerido</span
              >
            </div>
            <!-- Controles -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                @click="moveFieldUp(index)"
                :disabled="index === 0"
                type="button"
                class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
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
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                @click="moveFieldDown(index)"
                :disabled="index === form.fields.length - 1"
                type="button"
                class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <button
                @click="editField(index)"
                type="button"
                class="p-1 text-gray-400 hover:text-blue-600"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                @click="removeField(index)"
                type="button"
                class="p-1 text-gray-400 hover:text-red-600"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg"
        >
          Aún no hay campos. Agrega uno abajo.
        </div>

        <!-- Botones de agregar campo -->
        <div>
          <p class="text-xs text-gray-500 mb-2 font-medium">Agregar campo:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="type in fieldTypes"
              :key="type.value"
              type="button"
              @click="openFieldPanel(type.value)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-green-500 hover:text-green-700 transition-colors"
            >
              <span>{{ type.icon }}</span>
              <span>{{ type.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Info consultoría -->
      <div
        v-if="form.type === 'consulting'"
        class="bg-purple-50 border border-purple-200 rounded-xl p-5"
      >
        <div class="flex gap-3">
          <span class="text-2xl">🔍</span>
          <div>
            <p class="text-sm font-semibold text-purple-900">
              Actividad de Asesoría
            </p>
            <p class="text-sm text-purple-700 mt-1">
              Esta actividad usará el formulario estándar de diagnóstico
              empresarial con 7 categorías y 21 preguntas organizadas. Solo el
              facilitador podrá completarla.
            </p>
          </div>
        </div>
      </div>

      <!-- Botón crear -->
      <div class="flex gap-3">
        <button
          type="button"
          @click="goBack"
          class="flex-1 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="handleCreate"
          :disabled="!canCreate || saving"
          class="flex-1 py-3 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="saving">Creando...</span>
          <span v-else>Crear Actividad</span>
        </button>
      </div>
    </div>

    <!-- Panel lateral / modal para configurar campo -->
    <Teleport to="body">
      <div
        v-if="showFieldPanel"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/40" @click="closeFieldPanel" />
        <div
          class="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl p-6 space-y-4 z-10"
        >
          <h3 class="text-base font-semibold text-gray-900">
            {{ editingFieldIndex !== null ? "Editar campo" : "Nuevo campo" }}:
            {{ fieldTypeLabel(pendingField.type) }}
          </h3>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Título <span class="text-red-500">*</span></label
              >
              <input
                v-model="pendingField.title"
                type="text"
                placeholder="Ej: ¿Cuál es tu nombre?"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div v-if="pendingField.type !== 'attendance'">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Descripción</label
              >
              <input
                v-model="pendingField.description"
                type="text"
                placeholder="Instrucción adicional (opcional)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <!-- Opciones para select / options -->
            <div
              v-if="
                pendingField.type === 'select' ||
                pendingField.type === 'options'
              "
            >
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Opciones <span class="text-red-500">*</span></label
              >
              <div class="space-y-2">
                <div
                  v-for="(opt, i) in pendingField.options"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="pendingField.options[i]"
                    type="text"
                    :placeholder="`Opción ${i + 1}`"
                    class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    @click="removeOption(i)"
                    class="text-gray-400 hover:text-red-500"
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
                      />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addOption"
                  class="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar opción
                </button>
              </div>
            </div>

            <!-- Required (no aplicable a attendance) -->
            <div
              v-if="pendingField.type !== 'attendance'"
              class="flex items-center gap-2"
            >
              <input
                v-model="pendingField.required"
                type="checkbox"
                id="field-required"
                class="w-4 h-4 text-green-600 rounded"
              />
              <label for="field-required" class="text-sm text-gray-700"
                >Campo requerido</label
              >
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="closeFieldPanel"
              class="flex-1 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="saveField"
              :disabled="!pendingField.title"
              class="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {{
                editingFieldIndex !== null ? "Guardar cambios" : "Agregar campo"
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Template Picker -->
    <Teleport to="body">
      <div
        v-if="showTemplatePicker"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="closeTemplatePicker"
        />
        <div
          class="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-xl z-10 max-h-[80vh] flex flex-col"
        >
          <!-- Header -->
          <div class="p-5 border-b border-gray-100">
            <h3 class="text-base font-semibold text-gray-900 mb-3">
              Cargar template predefinido
            </h3>
            <input
              v-model="templateSearch"
              type="text"
              placeholder="Buscar template..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-400 mt-1.5">
              Los campos actuales serán reemplazados por los del template
              seleccionado.
            </p>
          </div>

          <!-- Lista de templates -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <template v-if="templateSearch.trim()">
              <!-- Resultados de búsqueda planos -->
              <button
                v-for="tpl in filteredTemplates"
                :key="tpl.id"
                type="button"
                @click="loadTemplate(tpl)"
                class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900">
                    {{ tpl.name }}
                  </p>
                  <span
                    class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                    >{{ tpl.fields.length }} campos</span
                  >
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ tpl.description }}
                </p>
                <p class="text-xs text-blue-500 mt-0.5">
                  {{ tpl.suggestedStage }}
                </p>
              </button>
              <div
                v-if="!filteredTemplates.length"
                class="py-6 text-center text-sm text-gray-400"
              >
                No se encontraron templates.
              </div>
            </template>
            <template v-else>
              <!-- Agrupados por etapa -->
              <div
                v-for="(templates, stageName) in templatesByStage"
                :key="stageName"
              >
                <p
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >
                  {{ stageName }}
                </p>
                <div class="space-y-2">
                  <button
                    v-for="tpl in templates"
                    :key="tpl.id"
                    type="button"
                    @click="loadTemplate(tpl)"
                    class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-gray-900">
                        {{ tpl.name }}
                      </p>
                      <span
                        class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                        >{{ tpl.fields.length }} campos</span
                      >
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ tpl.description }}
                    </p>
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-100">
            <button
              type="button"
              @click="closeTemplatePicker"
              class="w-full py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { useProgramStore } from "@/stores/programStore";
import { useToast } from "@/composables/useToast";
import {
  allTemplates,
  getTemplatesByStage,
  cloneTemplateFields,
} from "@/data/activityTemplates";

const route = useRoute();
const router = useRouter();
const { success, error: toastError } = useToast();
const {
  createActivity,
  loading: saving,
  loadProgramStages,
  saveStage,
  programStages,
} = useActivities();
const programStore = useProgramStore();

const programId = computed(() => route.params.programId);
const programName = ref("");

const form = ref({
  title: "",
  description: "",
  type: "activity",
  fields: [],
  stageId: "",
  stageName: "",
});

// ── Stage combobox ────────────────────────────────────
const stageSearch = ref("");
const showStageDropdown = ref(false);
const stageDropdownRef = ref(null);
const stageSaving = ref(false);

const filteredStages = computed(() => {
  const q = stageSearch.value.toLowerCase().trim();
  if (!q) return programStages.value;
  return programStages.value.filter((s) => s.name.toLowerCase().includes(q));
});

const exactStageMatch = computed(() => {
  const q = stageSearch.value.toLowerCase().trim();
  return programStages.value.some((s) => s.name.toLowerCase() === q);
});

const selectedStageName = computed(() => {
  if (!form.value.stageId) return "";
  const stage = programStages.value.find((s) => s.id === form.value.stageId);
  return stage?.name || form.value.stageName || "";
});

function selectStage(stage) {
  form.value.stageId = stage.id;
  form.value.stageName = stage.name;
  stageSearch.value = stage.name;
  showStageDropdown.value = false;
}

function clearStage() {
  form.value.stageId = "";
  form.value.stageName = "";
  stageSearch.value = "";
}

/**
 * Limpia la selección activa si el usuario modifica el texto del input.
 * Esto evita que se guarde una etapa con un nombre distinto al seleccionado.
 */
function handleStageInput() {
  showStageDropdown.value = true;
  // Si ya había una etapa seleccionada y el texto cambió, deseleccionarla
  if (form.value.stageId) {
    const selectedName =
      programStages.value.find((s) => s.id === form.value.stageId)?.name ?? "";
    if (stageSearch.value !== selectedName) {
      form.value.stageId = "";
      form.value.stageName = "";
    }
  }
}

async function createAndSelectStage() {
  const name = stageSearch.value.trim();
  if (!name || stageSaving.value) return; // Guard contra doble-click
  stageSaving.value = true;
  try {
    const stage = await saveStage(programId.value, name);
    selectStage(stage);
  } catch (err) {
    console.error(err);
    toastError("Error al crear la etapa");
  } finally {
    stageSaving.value = false;
  }
}

function handleClickOutsideStage(e) {
  if (stageDropdownRef.value && !stageDropdownRef.value.contains(e.target)) {
    showStageDropdown.value = false;
  }
}

// ── Field panel ────────────────────────────────────────
const showFieldPanel = ref(false);
const editingFieldIndex = ref(null);
const pendingField = ref(emptyField("text"));

const fieldTypes = [
  { value: "text", label: "Texto", icon: "✏️" },
  { value: "file", label: "Archivo", icon: "📎" },
  { value: "select", label: "Selección", icon: "🔽" },
  { value: "options", label: "Opciones", icon: "🔘" },
  { value: "attendance", label: "Asistencia", icon: "✅" },
];

// ── Template picker ────────────────────────────────────
const showTemplatePicker = ref(false);
const templateSearch = ref("");

const templatesByStage = computed(() => getTemplatesByStage());

const filteredTemplates = computed(() => {
  const q = templateSearch.value.toLowerCase().trim();
  if (!q) return allTemplates;
  return allTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.suggestedStage.toLowerCase().includes(q),
  );
});

function openTemplatePicker() {
  templateSearch.value = "";
  showTemplatePicker.value = true;
}

function closeTemplatePicker() {
  showTemplatePicker.value = false;
}

function loadTemplate(template) {
  // Reemplaza los fields actuales con los del template
  form.value.fields = cloneTemplateFields(template);
  form.value.title = form.value.title || template.name;
  form.value.description = form.value.description || template.description;
  closeTemplatePicker();
  success(`Template "${template.name}" cargado`);
}

function emptyField(type) {
  const field = {
    id: `field_${Date.now()}`,
    type,
    title: "",
    description: "",
    required: false,
    order: 0,
  };
  if (type === "select" || type === "options") {
    field.options = [""];
  }
  return field;
}

function fieldTypeLabel(type) {
  return fieldTypes.find((t) => t.value === type)?.label ?? type;
}

function fieldTypeBadge(type) {
  const map = {
    text: "bg-blue-100 text-blue-700",
    file: "bg-orange-100 text-orange-700",
    select: "bg-indigo-100 text-indigo-700",
    options: "bg-purple-100 text-purple-700",
    attendance: "bg-green-100 text-green-700",
  };
  return map[type] ?? "bg-gray-100 text-gray-700";
}

function openFieldPanel(type) {
  editingFieldIndex.value = null;
  pendingField.value = emptyField(type);
  showFieldPanel.value = true;
}

function editField(index) {
  editingFieldIndex.value = index;
  pendingField.value = JSON.parse(JSON.stringify(form.value.fields[index]));
  if (
    (pendingField.value.type === "select" ||
      pendingField.value.type === "options") &&
    !pendingField.value.options
  ) {
    pendingField.value.options = [""];
  }
  showFieldPanel.value = true;
}

function closeFieldPanel() {
  showFieldPanel.value = false;
  editingFieldIndex.value = null;
}

function saveField() {
  if (!pendingField.value.title) return;

  const field = {
    ...pendingField.value,
    order:
      editingFieldIndex.value !== null
        ? pendingField.value.order
        : form.value.fields.length,
  };

  // Limpiar opciones vacías en select/options
  if (field.type === "select" || field.type === "options") {
    field.options = (field.options || []).filter((o) => o.trim());
  }

  if (editingFieldIndex.value !== null) {
    form.value.fields[editingFieldIndex.value] = field;
  } else {
    field.id = `field_${Date.now()}`;
    form.value.fields.push(field);
  }

  closeFieldPanel();
}

function removeField(index) {
  form.value.fields.splice(index, 1);
}

function moveFieldUp(index) {
  if (index === 0) return;
  const arr = form.value.fields;
  [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
}

function moveFieldDown(index) {
  const arr = form.value.fields;
  if (index >= arr.length - 1) return;
  [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
}

function addOption() {
  if (!pendingField.value.options) pendingField.value.options = [];
  pendingField.value.options.push("");
}

function removeOption(i) {
  pendingField.value.options.splice(i, 1);
}

// ── Submit ────────────────────────────────────────────
const canCreate = computed(() => {
  if (!form.value.title.trim() || !form.value.type) return false;
  if (form.value.type === "activity" && form.value.fields.length === 0)
    return false;
  return true;
});

async function handleCreate() {
  if (!canCreate.value) return;

  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      type: form.value.type,
      isActive: true,
      order: 0,
    };

    if (form.value.type === "activity") {
      payload.fields = form.value.fields.map((f, i) => {
        const field = { ...f, order: i };
        // Eliminar propiedades undefined — Firestore no las soporta
        Object.keys(field).forEach((k) => {
          if (field[k] === undefined) delete field[k];
        });
        return field;
      });
    }

    // Asignar etapa si se seleccionó
    if (form.value.stageId) {
      payload.stageId = form.value.stageId;
      payload.stageName = form.value.stageName;
    }

    await createActivity(programId.value, payload);
    success("Actividad creada exitosamente");
    router.push(`/programs/${programId.value}/activities`);
  } catch (err) {
    console.error(err);
    toastError("Error al crear la actividad");
  }
}

function goBack() {
  router.push(`/programs/${programId.value}/activities`);
}

onMounted(async () => {
  await programStore.loadProgram(programId.value);
  programName.value = programStore.currentProgram?.name ?? "";
  // Cargar etapas del programa
  await loadProgramStages(programId.value);
  document.addEventListener("click", handleClickOutsideStage);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideStage);
});
</script>
