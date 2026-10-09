<template>
  <div class="max-w-2xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        🤖 Test de Clasificación con IA
      </h2>
      <p class="text-gray-600">
        Prueba el sistema de clasificación automática de productos usando Grok
      </p>
    </div>

    <!-- Input Section -->
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Nombre del producto
        </label>
        <input
          v-model="productDescription"
          type="text"
          placeholder="Ej: Coca Cola 1.5L, Arroz Costeño 5kg, etc."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          @keyup.enter="classifyProduct"
          :disabled="isClassifying"
        />
      </div>

      <button
        @click="classifyProduct"
        :disabled="!productDescription || isClassifying"
        class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <span v-if="isClassifying" class="animate-spin">⏳</span>
        <span v-else>🤖</span>
        <span>{{
          isClassifying ? "Clasificando..." : "Clasificar con IA"
        }}</span>
      </button>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
      >
        {{ errorMessage }}
      </div>
    </div>

    <!-- Results Section -->
    <div
      v-if="classification"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Resultado de la Clasificación
        </h3>
        <span
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            getConfidenceBadgeClass(classification.confidence),
          ]"
        >
          {{ getConfidenceLabel(classification.confidence) }}
        </span>
      </div>

      <!-- Warning si confidence < 0.8 -->
      <div
        v-if="classification.confidence < 0.8 && !isEditing"
        class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-amber-600 text-xl">⚠️</span>
          </div>
          <div class="ml-3">
            <p class="text-sm text-amber-800 font-medium">
              Confianza baja - Revisa la clasificación
            </p>
            <p class="text-xs text-amber-700 mt-1">
              Esta clasificación tiene menos del 80% de confianza. Te
              recomendamos revisarla antes de aceptarla.
            </p>
          </div>
        </div>
      </div>

      <!-- Modo Visualización -->
      <div v-if="!isEditing">
        <!-- Classification Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Category -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">Categoría</label>
            <div class="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              <p class="text-blue-900 font-medium">
                {{ classification.category || "N/A" }}
              </p>
            </div>
          </div>

          <!-- Subcategory -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600"
              >Subcategoría</label
            >
            <div class="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              <p class="text-blue-900 font-medium">
                {{ classification.subcategory || "N/A" }}
              </p>
            </div>
          </div>

          <!-- Subsubcategory (if exists) -->
          <div v-if="classification.subsubcategory" class="space-y-2">
            <label class="text-sm font-medium text-gray-600"
              >Sub-subcategoría</label
            >
            <div class="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              <p class="text-blue-900 font-medium">
                {{ classification.subsubcategory }}
              </p>
            </div>
          </div>

          <!-- Brand (if exists) -->
          <div v-if="classification.brand" class="space-y-2">
            <label class="text-sm font-medium text-gray-600">Marca</label>
            <div
              class="bg-purple-50 px-4 py-3 rounded-lg border border-purple-200"
            >
              <p class="text-purple-900 font-medium">
                {{ classification.brand }}
              </p>
            </div>
          </div>

          <!-- Presentation (if exists) -->
          <div v-if="classification.presentation" class="space-y-2">
            <label class="text-sm font-medium text-gray-600"
              >Presentación</label
            >
            <div
              class="bg-green-50 px-4 py-3 rounded-lg border border-green-200"
            >
              <p class="text-green-900 font-medium">
                {{ classification.presentation }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div
          v-if="classification.tags && classification.tags.length > 0"
          class="space-y-2 mt-4"
        >
          <label class="text-sm font-medium text-gray-600">Tags</label>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in classification.tags"
              :key="tag"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            @click="acceptClassification"
            :disabled="isSaving"
            class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span v-if="isSaving" class="animate-spin">⏳</span>
            <span v-else>✓</span>
            <span>{{ isSaving ? "Guardando..." : "Aceptar" }}</span>
          </button>
          <button
            @click="enableEditing"
            :disabled="isSaving"
            class="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
        </div>
      </div>

      <!-- Modo Edición -->
      <div v-else class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p class="text-sm text-blue-800 font-medium">
            ✏️ Modo Edición - Personaliza la clasificación
          </p>
        </div>

        <!-- Categoría con Autocomplete -->
        <AutocompleteInput
          v-model="editedClassification.category"
          :suggestions="categorySuggestions"
          label="Categoría"
          placeholder="Selecciona o escribe una categoría"
        />

        <!-- Subcategoría con Autocomplete -->
        <AutocompleteInput
          v-model="editedClassification.subcategory"
          :suggestions="subcategorySuggestions"
          label="Subcategoría"
          placeholder="Selecciona o escribe una subcategoría"
        />

        <!-- Sub-subcategoría con Autocomplete -->
        <AutocompleteInput
          v-model="editedClassification.subsubcategory"
          :suggestions="subsubcategorySuggestions"
          label="Sub-subcategoría (opcional)"
          placeholder="Selecciona o escribe una sub-subcategoría"
        />

        <!-- Marca con Autocomplete -->
        <AutocompleteInput
          v-model="editedClassification.brand"
          :suggestions="brandSuggestions"
          label="Marca (opcional)"
          placeholder="Selecciona o escribe una marca"
        />

        <!-- Presentación (input libre) -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Presentación (opcional)
          </label>
          <input
            v-model="editedClassification.presentation"
            type="text"
            placeholder="Ej: 1L, 500g, Pack 6 unidades"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            @click="saveChanges"
            :disabled="isSaving || !editedClassification.category"
            class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span v-if="isSaving" class="animate-spin">⏳</span>
            <span v-else>💾</span>
            <span>{{ isSaving ? "Guardando..." : "Guardar Cambios" }}</span>
          </button>
          <button
            @click="cancelEditing"
            :disabled="isSaving"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      <!-- Metadata -->
      <div class="pt-4 border-t border-gray-200 space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Fuente:</span>
          <span :class="getSourceBadgeClass(classification.source)">
            {{ getSourceLabel(classification.source) }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Confianza:</span>
          <span class="font-medium text-gray-900">
            {{ (classification.confidence * 100).toFixed(1) }}%
          </span>
        </div>
        <div
          v-if="classification.model"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-600">Modelo:</span>
          <span class="font-mono text-gray-700 text-xs">
            {{ classification.model }}
          </span>
        </div>
      </div>
    </div>

    <!-- Taxonomy Info -->
    <div
      v-if="taxonomyLoaded"
      class="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2"
    >
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span>✅</span>
        <span
          >Taxonomía global cargada para industria:
          <strong>{{ currentIndustry }}</strong></span
        >
      </div>
      <div
        v-if="localTaxonomyLoaded"
        class="flex items-center gap-2 text-sm text-gray-600"
      >
        <span>🏪</span>
        <span
          >Taxonomía local del negocio:
          <strong>{{ localTaxonomyStats }}</strong></span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useBusinessStore } from "@/stores/businessStore";
import { useInventory } from "@/composables/useInventory";
import { useToast } from "@/composables/useToast";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AutocompleteInput from "@/components/ui/AutocompleteInput.vue";

const businessStore = useBusinessStore();
const inventory = useInventory();
const toast = useToast();

// Estado local
const productDescription = ref("");
const isClassifying = ref(false);
const classification = ref(null);
const errorMessage = ref("");
const taxonomyData = ref(null);
const taxonomyLoaded = ref(false);
const localTaxonomyData = ref(null);
const localTaxonomyLoaded = ref(false);

// Estados de edición
const isEditing = ref(false);
const isSaving = ref(false);
const editedClassification = ref({
  category: "",
  subcategory: "",
  subsubcategory: "",
  brand: "",
  presentation: "",
});

// Computed
const currentIndustry = computed(
  () => businessStore.business.industry || "N/A",
);

const localTaxonomyStats = computed(() => {
  if (!localTaxonomyData.value || !localTaxonomyData.value.stats) {
    return "Sin datos";
  }
  const stats = localTaxonomyData.value.stats;
  return `${stats.totalCustomItems || 0} items personalizados`;
});

// Sugerencias para Autocomplete (de taxonomía global + local)
const categorySuggestions = computed(() => {
  const suggestions = [];

  // De taxonomía global
  if (taxonomyData.value && taxonomyData.value.categories) {
    suggestions.push(...Object.keys(taxonomyData.value.categories));
  }

  // De taxonomía local
  if (localTaxonomyData.value && localTaxonomyData.value.customCategories) {
    localTaxonomyData.value.customCategories.forEach((cat) => {
      if (cat.category && !suggestions.includes(cat.category)) {
        suggestions.push(cat.category);
      }
    });
  }

  return suggestions.sort();
});

const subcategorySuggestions = computed(() => {
  const suggestions = [];
  const selectedCategory = editedClassification.value.category;

  if (!selectedCategory) return suggestions;

  // De taxonomía global
  if (
    taxonomyData.value &&
    taxonomyData.value.categories &&
    taxonomyData.value.categories[selectedCategory]
  ) {
    suggestions.push(
      ...Object.keys(taxonomyData.value.categories[selectedCategory]),
    );
  }

  // De taxonomía local
  if (localTaxonomyData.value && localTaxonomyData.value.customCategories) {
    localTaxonomyData.value.customCategories
      .filter((cat) => cat.category === selectedCategory && cat.subcategory)
      .forEach((cat) => {
        if (!suggestions.includes(cat.subcategory)) {
          suggestions.push(cat.subcategory);
        }
      });
  }

  return suggestions.sort();
});

const subsubcategorySuggestions = computed(() => {
  const suggestions = [];
  const selectedCategory = editedClassification.value.category;
  const selectedSubcategory = editedClassification.value.subcategory;

  if (!selectedCategory || !selectedSubcategory) return suggestions;

  // De taxonomía global
  if (
    taxonomyData.value &&
    taxonomyData.value.categories &&
    taxonomyData.value.categories[selectedCategory] &&
    taxonomyData.value.categories[selectedCategory][selectedSubcategory]
  ) {
    const items =
      taxonomyData.value.categories[selectedCategory][selectedSubcategory];
    if (Array.isArray(items)) {
      suggestions.push(...items);
    }
  }

  // De taxonomía local
  if (localTaxonomyData.value && localTaxonomyData.value.customCategories) {
    localTaxonomyData.value.customCategories
      .filter(
        (cat) =>
          cat.category === selectedCategory &&
          cat.subcategory === selectedSubcategory,
      )
      .forEach((cat) => {
        if (cat.items && Array.isArray(cat.items)) {
          cat.items.forEach((item) => {
            if (!suggestions.includes(item)) {
              suggestions.push(item);
            }
          });
        }
      });
  }

  return suggestions.sort();
});

const brandSuggestions = computed(() => {
  const suggestions = [];

  // De taxonomía global
  if (taxonomyData.value && taxonomyData.value.brands) {
    suggestions.push(...taxonomyData.value.brands);
  }

  // De taxonomía local
  if (localTaxonomyData.value && localTaxonomyData.value.customBrands) {
    localTaxonomyData.value.customBrands.forEach((brand) => {
      if (!suggestions.includes(brand)) {
        suggestions.push(brand);
      }
    });
  }

  return suggestions.sort();
});

// Métodos
const loadTaxonomy = async () => {
  try {
    const industry = businessStore.business.industry;
    if (!industry) {
      console.warn("⚠️ No industry found for business");
      errorMessage.value = "No se encontró la industria del negocio";
      return;
    }

    const db = getFirestore();

    // Cargar taxonomía global
    const taxonomyRef = doc(db, "wala_global", "taxonomies", industry, "main");
    const taxonomySnap = await getDoc(taxonomyRef);

    if (taxonomySnap.exists()) {
      taxonomyData.value = taxonomySnap.data();
      taxonomyLoaded.value = true;
      console.log("✅ Taxonomía global cargada para:", industry);
    } else {
      console.warn(`⚠️ No taxonomy found for industry: ${industry}`);
      errorMessage.value = `No se encontró taxonomía para: ${industry}`;
    }

    // Cargar taxonomía local
    await loadLocalTaxonomy();
  } catch (error) {
    console.error("❌ Error loading taxonomy:", error);
    errorMessage.value = "Error al cargar la taxonomía";
  }
};

const loadLocalTaxonomy = async () => {
  try {
    const businessId = businessStore.business.id;
    if (!businessId) {
      console.warn("⚠️ No businessId found");
      return;
    }

    const data = await inventory.loadLocalTaxonomy(businessId);
    localTaxonomyData.value = data;
    localTaxonomyLoaded.value = true;
    console.log("✅ Taxonomía local cargada:", data);
  } catch (error) {
    console.error("❌ Error loading local taxonomy:", error);
  }
};

const classifyProduct = async () => {
  if (!productDescription.value) {
    errorMessage.value = "Ingresa un nombre de producto primero";
    return;
  }

  try {
    isClassifying.value = true;
    errorMessage.value = "";
    classification.value = null;
    isEditing.value = false;

    console.log("🤖 Clasificando producto:", productDescription.value);

    const result = await inventory.classifyProduct(productDescription.value);
    classification.value = result;

    console.log("✅ Clasificación exitosa:", result);
  } catch (error) {
    console.error("❌ Error classifying product:", error);
    errorMessage.value = error.message || "Error al clasificar el producto";
    toast.error("Error al clasificar el producto");
  } finally {
    isClassifying.value = false;
  }
};

const acceptClassification = async () => {
  try {
    isSaving.value = true;

    console.log("🎯 Aceptando clasificación:", {
      classification: classification.value,
      productDescription: productDescription.value,
      businessId: businessStore.business.id,
      industry: businessStore.business.industry,
    });

    const result = await inventory.updateTaxonomyFromClassification(
      classification.value,
      productDescription.value,
      true, // isAccepted
      businessStore.business.id,
      businessStore.business.industry,
    );

    console.log("📊 Resultado de updateTaxonomyFromClassification:", result);

    if (result.updated) {
      toast.success(result.message, { duration: 3000 });

      // Recargar taxonomías
      await loadTaxonomy();
    } else {
      toast.info(result.message, { duration: 2000 });
    }
  } catch (error) {
    console.error("❌ Error accepting classification:", error);
    toast.error("Error al guardar la clasificación");
  } finally {
    isSaving.value = false;
  }
};

const enableEditing = () => {
  isEditing.value = true;
  editedClassification.value = {
    category: classification.value.category || "",
    subcategory: classification.value.subcategory || "",
    subsubcategory: classification.value.subsubcategory || "",
    brand: classification.value.brand || "",
    presentation: classification.value.presentation || "",
  };
};

const cancelEditing = () => {
  isEditing.value = false;
  editedClassification.value = {
    category: "",
    subcategory: "",
    subsubcategory: "",
    brand: "",
    presentation: "",
  };
};

const saveChanges = async () => {
  try {
    isSaving.value = true;

    // Crear clasificación editada con source: 'manual'
    const manualClassification = {
      ...editedClassification.value,
      source: "manual",
      confidence: 1.0,
      tags: classification.value.tags || [],
    };

    const result = await inventory.updateTaxonomyFromClassification(
      manualClassification,
      productDescription.value,
      false, // isAccepted = false (fue editada)
      businessStore.business.id,
      businessStore.business.industry,
    );

    if (result.updated) {
      toast.success(result.message, { duration: 3000 });

      // Actualizar clasificación mostrada
      classification.value = manualClassification;

      // Salir del modo edición
      isEditing.value = false;

      // Recargar taxonomías
      await loadTaxonomy();
    } else {
      toast.warning("No se pudo guardar la clasificación");
    }
  } catch (error) {
    console.error("❌ Error saving changes:", error);
    toast.error("Error al guardar los cambios");
  } finally {
    isSaving.value = false;
  }
};

// Helpers para badges
const getConfidenceLabel = (confidence) => {
  if (confidence >= 0.9) return "🎯 Alta Confianza";
  if (confidence >= 0.7) return "💡 Media Confianza";
  return "⚠️ Baja Confianza";
};

const getConfidenceBadgeClass = (confidence) => {
  if (confidence >= 0.9)
    return "bg-green-100 text-green-800 border border-green-200";
  if (confidence >= 0.7)
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  return "bg-red-100 text-red-800 border border-red-200";
};

const getSourceLabel = (source) => {
  const labels = {
    llm: "🤖 IA (Grok)",
    local_match: "🎯 Coincidencia Local",
    rules: "📋 Reglas",
    manual: "✋ Manual",
  };
  return labels[source] || source;
};

const getSourceBadgeClass = (source) => {
  if (source === "llm")
    return "px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium";
  if (source === "local_match")
    return "px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium";
  if (source === "rules")
    return "px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium";
  return "px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium";
};

// Lifecycle
onMounted(() => {
  loadTaxonomy();
});
</script>
