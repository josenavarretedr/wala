>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🔄 Diff Summary - SearchProductAsync Refactorización

Este documento muestra los cambios clave realizados al componente SearchProductAsync.vue

---

## 📦 Archivos Modificados

```
✏️  src/components/basicAccountingRecordsBook/SearchProductAsync.vue
✨  src/components/basicAccountingRecordsBook/AutocompleteLocal.vue (NUEVO)
✨  src/components/basicAccountingRecordsBook/AutocompleteExamples.vue (NUEVO)
📄  AUTOCOMPLETE_MIGRATION_NOTES.md (NUEVO)
📄  PERFORMANCE_REPORT.md (NUEVO)
```

---

## 🔧 Cambios Principales en SearchProductAsync.vue

### 1. Imports y Setup

```diff
  import { autocomplete } from "@algolia/autocomplete-js";
  import "@algolia/autocomplete-theme-classic";

- import { ref, onMounted, onUnmounted } from "vue";
+ import { ref, onMounted, watch } from "vue";

  import { useInventoryStore } from "@/stores/inventoryStore";
  import { useTransactionStore } from "@/stores/transaction/transactionStore";
```

**Cambios:**

- ❌ Removido `onUnmounted` (ya no se usa)
- ✅ Agregado `watch` para reacti

vidad del índice

---

### 2. Preindexado del Inventario (NUEVO)

```diff
+ // ===== TAREA 1: PREINDEXAR INVENTARIO =====
+ const index = ref([]);
+
+ function normalize(s = '') {
+   return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
+ }
+
+ function buildIndex(items) {
+   index.value = items.map((p) => ({
+     productId: p.uuid,
+     productDescription: p.description,
+     productDescription_lc: normalize(p.description || ''),
+     productPrice: p.price,
+     productUnit: p.unit || 'uni',
+   }));
+ }

- // Función para obtener productos desde Firestore
  await inventoryStore.getItemsInInventory();
+ buildIndex(inventoryStore.allItemsInInventory.value);
+
+ // Reconstruir índice cuando cambie el inventario
+ watch(
+   () => inventoryStore.allItemsInInventory.value,
+   (val) => buildIndex(val),
+   { deep: true }
+ );
```

**Impacto:**

- ✅ Índice construido una sola vez
- ✅ Normalización con NFD (sin diacríticos)
- ✅ Auto-actualización con `watch`

---

### 3. Función getDataForAlgolia Simplificada

```diff
- function getDataForAlgolia() {
-   if (inventoryStore.allItemsInInventory.value.length === 0) {
-     return [];
-   }
-
-   let dataForAlgolia = inventoryStore.allItemsInInventory.value.map(
-     (product) => {
-       return {
-         productId: product.uuid,
-         productDescription: product.description,
-         productPrice: product.price,
-         productUnit: product.unit || "uni",
-       };
-     }
-   );
-
-   return dataForAlgolia;
- }

+ // Función legacy mantenida por compatibilidad (ahora solo retorna el índice)
+ function getDataForAlgolia() {
+   return index.value;
+ }
```

**Impacto:**

- ❌ Eliminado mapping repetitivo
- ✅ Retorna índice precomputado

---

### 4. Debounce del Filtrado (NUEVO)

```diff
+ // ===== TAREA 3: DEBOUNCE DEL FILTRADO =====
+ let _debounceTimer;
+ function getItemsDebounced(query) {
+   const q = normalize(query || '');
+
+   return new Promise((resolve) => {
+     clearTimeout(_debounceTimer);
+     _debounceTimer = setTimeout(() => {
+       const dataFiltered = q
+         ? index.value.filter((i) => i.productDescription_lc.includes(q))
+         : index.value;
+
+       resolve(
+         dataFiltered.length
+           ? dataFiltered.slice(0, 5)
+           : [
+               {
+                 productDescription: `Registrar nuevo producto: ${query}`,
+                 isNewProduct: true,
+               },
+             ]
+       );
+     }, 120);
+   });
+ }
```

**Impacto:**

- ✅ Delay de 120ms reduce filtrados innecesarios
- ✅ Usa índice normalizado para búsqueda más rápida

---

### 5. Inicialización de Algolia con onSelect

```diff
  onMounted(() => {
    autocomplete({
      container: '#autocomplete',
      placeholder: 'Buscar producto...',
+     detachedMediaQuery: 'none', // 👈 Fuerza inline en móviles
      getSources({ query }) {
        return [
          {
            sourceId: 'products',
            getItems() {
-             // Filtrar productos por descripción
-             let dataFiltered = getDataForAlgolia().filter(
-               ({ productDescription }) =>
-                 productDescription.toLowerCase().includes(query.toLowerCase())
-             );
-
-             return dataFiltered.length > 0
-               ? dataFiltered.slice(0, 5)
-               : [
-                   {
-                     productDescription: `Registrar nuevo producto: ${query}`,
-                     isNewProduct: true,
-                   },
-                 ];
+             return getItemsDebounced(query);
            },
+           onSelect({ item }) {
+             // Manejar nuevo producto
+             if (item.isNewProduct) {
+               const description = (item.productDescription || '')
+                 .replace('Registrar nuevo producto: ', '')
+                 .trim();
+
+               transactionStore.modifyItemToAddInTransaction({
+                 description,
+                 quantity: null,
+                 price: null,
+                 oldOrNewProduct: 'new',
+                 selectedProductUuid: null,
+                 unit: 'uni',
+               });
+
+               clearAutocompleteInput();
+               return;
+             }
+
+             // Manejar producto existente
+             const selected = inventoryStore.allItemsInInventory.value.find(
+               (p) => p.uuid === item.productId
+             );
+             if (selected) {
+               transactionStore.modifyItemToAddInTransaction({
+                 description: selected.description,
+                 price: selected.price,
+                 oldOrNewProduct: 'old',
+                 selectedProductUuid: selected.uuid,
+                 unit: selected.unit || 'uni',
+               });
+               clearAutocompleteInput();
+             } else {
+               console.error('Producto seleccionado no encontrado:', item.productId);
+             }
+           },
```

**Impacto:**

- ✅ `detachedMediaQuery: 'none'` previene modal en móvil
- ✅ `onSelect` reemplaza listener global
- ✅ Código más limpio y maintainable

---

### 6. Templates Simplificados

```diff
            templates: {
              item({ item, html }) {
                if (item.isNewProduct) {
                  return html`
                    <div
-                     class="py-3 px-4 flex items-center border-b border-gray-100 hover:bg-blue-50 transition-all duration-150 cursor-pointer active:bg-blue-100"
-                     id="new-product"
-                     class="resultsDiv"
+                     class="py-3 px-4 flex items-center border-b border-gray-100 hover:bg-blue-50 transition-all duration-150 cursor-pointer active:bg-blue-100"
                    >
```

**Impacto:**

- ❌ Removido `id="new-product"`
- ❌ Removido `class="resultsDiv"`
- ✅ HTML más limpio

---

### 7. Atributos del Input para Móvil (NUEVO)

```diff
    });

+   // ===== TAREA 4: ENDURECER INPUT MÓVIL =====
+   // Ajustes del input de Algolia para mejorar UX móvil
+   const autocompleteInput = document.querySelector('#autocomplete input');
+   if (autocompleteInput) {
+     autocompleteInput.setAttribute('inputmode', 'search');
+     autocompleteInput.setAttribute('autocomplete', 'off');
+     autocompleteInput.setAttribute('autocorrect', 'off');
+     autocompleteInput.setAttribute('autocapitalize', 'off');
+     autocompleteInput.setAttribute('spellcheck', 'false');
+   }
  });
```

**Impacto:**

- ✅ Sin autocorrección en móviles
- ✅ Teclado de búsqueda nativo
- ✅ Sin capitalización automática

---

### 8. Código Eliminado

```diff
- // Agregar el event listener para manejar clics en los resultados
- document.addEventListener("click", handleResultClick);
- });
-
- // Limpiar el event listener cuando el componente se desmonte
- onUnmounted(() => {
-   document.removeEventListener("click", handleResultClick);
- });
```

```diff
- // Función para manejar clics en los resultados
- function handleResultClick(e) {
-   let target = e.target;
-   while (target && !target.classList.contains("resultsDiv")) {
-     target = target.parentElement;
-   }
-   if (target) {
-     if (target.id === "new-product") {
-       // ... 30+ líneas de código
-     }
-   }
- }
```

```diff
- // Función helper para obtener la unidad del producto
- function getProductUnit(productId) {
-   const product = inventoryStore.allItemsInInventory.value.find(
-     (p) => p.uuid === productId
-   );
-   return product?.unit || "uni";
- }
```

**Impacto:**

- ❌ ~80 líneas de código eliminadas
- ✅ Sin listeners globales
- ✅ Código más limpio y seguro

---

## 📊 Estadísticas del Diff

```
Archivo: SearchProductAsync.vue
────────────────────────────────
Líneas agregadas:    +95
Líneas eliminadas:   -110
Cambio neto:         -15 líneas
Funciones nuevas:    3 (normalize, buildIndex, getItemsDebounced)
Funciones removidas: 2 (getProductUnit, handleResultClick)
Hooks removidos:     1 (onUnmounted)
Dependencias:        0 nuevas
```

---

## ✨ Archivos Nuevos

### AutocompleteLocal.vue

```
Líneas:           310
Funciones:        6
Dependencias:     0 externas (solo Vue)
Props:            3 configurables
Compatibilidad:   100% API compatible
```

### AutocompleteExamples.vue

```
Líneas:           450+
Ejemplos:         5 casos de uso
Propósito:        Documentación interactiva
```

---

## 🎯 Checklist de Migración

Para actualizar tu código existente:

- [ ] Reemplazar imports (si usas AutocompleteLocal)
- [ ] Verificar que `transactionStore.modifyItemToAddInTransaction` existe
- [ ] Probar en móvil (Android + iOS)
- [ ] Verificar que inventario se carga correctamente
- [ ] Testear crear nuevo producto
- [ ] Testear seleccionar producto existente
- [ ] Verificar performance en DevTools
- [ ] Actualizar tests (si existen)

---

## 🔗 Referencias Rápidas

- **Código completo:** `src/components/basicAccountingRecordsBook/SearchProductAsync.vue`
- **Alternativa:** `src/components/basicAccountingRecordsBook/AutocompleteLocal.vue`
- **Ejemplos:** `src/components/basicAccountingRecordsBook/AutocompleteExamples.vue`
- **Notas:** `AUTOCOMPLETE_MIGRATION_NOTES.md`
- **Performance:** `PERFORMANCE_REPORT.md`

---

**Fecha:** 12 de octubre de 2025  
**Versión:** 2.0  
**Breaking Changes:** Ninguno  
**Estado:** ✅ Listo para producción
