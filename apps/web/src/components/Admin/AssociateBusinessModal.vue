<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title text-gray-900">
            Vincular Lead a Negocio Real
          </h2>
          <button @click="closeModal" class="modal-close">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body space-y-4">
          <div class="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-sm">
            <p class="text-gray-650">
              Vincular a: <span class="font-bold text-gray-900">{{ leadName }}</span>
            </p>
          </div>

          <!-- Search Input -->
          <div class="space-y-1.5">
            <label class="field-label text-xs font-bold text-gray-700">Buscar negocio por nombre</label>
            <div class="flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Ej: Salón Spa, Ferretería..."
                class="field-input flex-1"
                @keypress.enter="performSearch"
              />
              <button 
                @click="performSearch" 
                :disabled="searching"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-lg text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {{ searching ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>

          <!-- Results -->
          <div class="results-container border border-gray-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <div v-if="results.length > 0" class="divide-y divide-gray-100">
              <div 
                v-for="biz in results" 
                :key="biz.id" 
                class="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div class="min-w-0 pr-3">
                  <p class="text-sm font-bold text-gray-950 truncate">{{ biz.nombre }}</p>
                  <p class="text-xs text-gray-500">ID: {{ biz.id.substring(0, 8) }}... | Rubro: {{ biz.tipo || 'No especificado' }}</p>
                </div>
                <button 
                  @click="selectBusiness(biz)"
                  class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
                >
                  Vincular
                </button>
              </div>
            </div>
            <div v-else-if="searched" class="p-8 text-center text-gray-500 text-sm">
              No se encontraron negocios con ese nombre.
            </div>
            <div v-else class="p-8 text-center text-gray-400 text-sm">
              Escribe un nombre para buscar.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from "vue";
import { useBusinessStore } from "@/stores/businessStore";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  leadId: { type: String, default: "" },
  leadName: { type: String, default: "" }
});

const emit = defineEmits(["close", "submit"]);

const businessStore = useBusinessStore();
const { showToast } = useToast();

const searchQuery = ref("");
const searching = ref(false);
const searched = ref(false);
const results = ref([]);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    searchQuery.value = props.leadName;
    results.value = [];
    searched.value = false;
    // Pre-buscar con el nombre del lead
    if (searchQuery.value.trim()) {
      performSearch();
    }
  }
});

const performSearch = async () => {
  if (!searchQuery.value.trim()) return;
  searching.value = true;
  searched.value = true;
  try {
    results.value = await businessStore.searchBusinesses(searchQuery.value.trim());
  } catch (err) {
    console.error("Error searching businesses:", err);
    showToast({ message: "Error al buscar negocios", type: "error" });
  } finally {
    searching.value = false;
  }
};

const selectBusiness = (biz) => {
  emit("submit", {
    recordId: props.leadId,
    businessId: biz.id,
    businessName: biz.nombre
  });
  closeModal();
};

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 25px 50px rgb(0 0 0 / 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
}

.modal-close {
  padding: 0.35rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-close:hover { background: #f3f4f6; }

.modal-body {
  padding: 1.5rem;
}

.field-label {
  display: block;
}

.field-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.field-input:focus {
  border-color: #6366f1;
}

.results-container {
  min-height: 120px;
  background: #fff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-secondary {
  padding: 0.6rem 1rem;
  border-radius: 0.65rem;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover { background: #f9fafb; }
</style>
