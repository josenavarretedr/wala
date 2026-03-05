# `inventoryStore.js` — Documentación del Store de Inventario

**Archivo:** `src/stores/inventoryStore.js`
**Tipo:** Composable Store (no Pinia, exportado como función)
**Módulo:** Inventario — Productos y Stock

---

## ⚠️ Nota Importante

Este store es un **composable-style store** (no usa `defineStore`). Define variables **module-level** reactivas accesibles vía `useInventoryStore()`.

---

## Dependencias

Delega operaciones a:

- `useInventory` (composable) — CRUD de productos y stockLogs en Firestore
- `useTraceability` — registro de trazabilidad en operaciones de inventario

---

## State (Module-Level)

| Variable               | Tipo          | Descripción                                          |
| ---------------------- | ------------- | ---------------------------------------------------- |
| `allItemsInInventory`  | `Ref<Array>`  | Lista reactiva de todos los productos del inventario |
| `itemToAddToInventory` | `Ref<Object>` | Producto en construcción para agregar                |

---

## Actions

### `getItemsInInventory()`

**Descripción:** Carga todos los productos del inventario del negocio activo desde Firestore.
**Efectos:** Actualiza `allItemsInInventory`.

---

### `getProductDetails(productId)`

**Descripción:** Obtiene los detalles completos de un producto por su ID.
**Parámetros:** `productId` — String (UUID del producto)
**Retorna:** Object con datos del producto o `null`.

---

### `addStockLogInInventory(stockLog, typeStockLog?)`

**Descripción:** Registra un movimiento de stock (StockLog) en Firestore con trazabilidad.
**Parámetros:**

- `stockLog` — Object con datos del movimiento
- `typeStockLog` — `'sell'` | `'buy'` | `'adjustment'` (default: `'sell'`)

---

### `addItemToInventoryFromArryOfItemsNewOrOld(itemsList)`

**Descripción:** Agrega múltiples productos al inventario (nuevos o existentes) en un bulk.
**Parámetros:** `itemsList` — Array de productos con flags `oldOrNewProduct`.

---

### `addMaterialItemsToInventoryForPurchase(materialItems, transactionId?)`

**Descripción:** Registra la compra de materiales al inventario con sus respectivos stockLogs.
**Parámetros:**

- `materialItems` — Array de materiales comprados
- `transactionId` — String opcional (UUID de la transacción padre)

---

### `saveInventoryCount(countData)`

**Descripción:** Guarda el resultado de un conteo de inventario como ajuste de stock.
**Parámetros:** `countData` — Object con diferencias de conteo.

---

### `updateProduct(productId, updatedData)`

**Alias:** `updateProductDetails(productId, updatedData)`

**Descripción:** Actualiza los datos de un producto en Firestore con trazabilidad.
**Parámetros:**

- `productId` — String (UUID)
- `updatedData` — Object con los campos a actualizar

---

### `createNewProduct(productData)`

**Descripción:** Crea un nuevo producto en el inventario con trazabilidad completa. Refresca `allItemsInInventory` al terminar.
**Parámetros:** `productData` — Object con datos del nuevo producto.
**Retorna:** String (UUID del producto creado).

---

## Uso en Componentes

`useInventoryStore()` es usado en:

`AutocompleteLocal.vue`, `ListAllProducts.vue`, `NavigationBtnInventoryCount.vue`, `SearchProductAsync.vue`, `SearchProductForCreation.vue`, `SearchProductForExpenseAsync.vue`, `AddProduct.vue`, `AddStock.vue`, `EditProduct.vue`, `EditProductComposition.vue`, `EditProductEconomicInfo.vue`, `EditProductGeneralInfo.vue`, `EditProduct_OLD.vue`, `InventoyStock.vue`, `RemoveStock.vue`, `ClasificationTest.vue`, `TopProductsByRevenue.vue`, `TopProductsByUnits.vue`.

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo y ampliamente usado en producción.
