# Error: Producto no existe al crear Stock Log

## 🐛 Error

```
FirebaseError: NOT_FOUND: no entity to update
```

Este error ocurre cuando se intenta crear un `stockLog` para un producto que **no existe** en Firestore.

## 🔍 Causa del Problema

### Flujo de Transacciones de Ingreso:

1. **Usuario agrega items** (productos) a una transacción
2. Items se marcan como `oldOrNewProduct: "new"` o `oldOrNewProduct: "old"`
3. Se llama a `addItemToInventoryFromArryOfItemsNewOrOld()`
   - ✅ Crea productos con `oldOrNewProduct === "new"`
   - ⚠️ **NO crea** productos con `oldOrNewProduct === "old"` (asume que ya existen)
4. Se llama a `addTransaction()`
   - Intenta crear `stockLog` para **TODOS** los items
   - ❌ **FALLA** si algún item "old" no existe realmente en Firestore

### Escenario del Error:

```javascript
// Item marcado como "old" pero que NO existe en Firestore
{
  uuid: "f91eacba-c062-4740-b083-614b2f6f6923",
  description: "Producto X",
  oldOrNewProduct: "old",  // ⚠️ Marcado como existente
  quantity: 5
}

// Cuando addItemToInventoryFromArryOfItemsNewOrOld() ejecuta:
if (item.oldOrNewProduct === "new") {
  await createItem(item);  // ⬅️ Solo crea si es "new"
}

// Más tarde, en addTransaction():
await createStockLog(item);  // ❌ Falla porque el producto no existe
```

## ✅ Solución Implementada

### 1. Validación Mejorada en `createStockLog()`

Ahora se verifica que el producto exista **antes** de intentar actualizar:

```javascript
const productRef = doc(db, `businesses/${businessId}/products`, item.uuid);

// Verificar si el producto existe
const productDoc = await getDoc(productRef);

if (!productDoc.exists()) {
  console.error("❌ Error: El producto no existe en Firestore", {
    productId: item.uuid,
    businessId,
    productDescription: item.description || "N/A",
    typeStockLog,
    itemData: item,
  });

  throw new Error(
    `El producto "${item.description || item.uuid}" no existe en Firestore.\n` +
      `Posibles causas:\n` +
      `1. El producto fue marcado como "old" pero nunca fue creado\n` +
      `2. El producto fue eliminado previamente\n` +
      `3. Error en la sincronización de datos`
  );
}

// Si existe, proceder con la actualización
await updateDoc(productRef, {
  stockLog: arrayUnion({ ...stockLog, createdAt: new Date() }),
});
```

### 2. Auto-Corrección en `addItemToInventoryFromArryOfItemsNewOrOld()` ⭐ NUEVO

Ahora el sistema **verifica automáticamente** si los productos "old" realmente existen:

```javascript
for (const item of itemsList) {
  // Verificar si el producto "old" realmente existe
  if (item.oldOrNewProduct === "old") {
    const productId = item.uuid || item.selectedProductUuid;

    // Buscar el producto en Firestore
    const productExists = await getProductById(productId);

    if (!productExists) {
      // ✅ Convertir automáticamente a "new"
      console.warn(
        `⚠️ Producto ${productId} marcado como "old" pero no existe. ` +
          `Convirtiendo a "new" automáticamente.`
      );

      item.oldOrNewProduct = "new";

      // Log de trazabilidad
      await operationChain.addStep("update", "inventory", productId, {
        reason: "auto_convert_old_to_new",
        severity: "medium",
        tags: ["inventory_validation", "auto_correction", "data_integrity"],
      });
    }
  }

  // Ahora crear solo los "new"
  if (item.oldOrNewProduct === "new") {
    await createItem(item);
  }
}
```

**Beneficios**:

- ✅ **Previene el error** antes de que ocurra
- ✅ **Auto-corrección automática**: convierte "old" a "new" si el producto no existe
- ✅ **Trazabilidad completa**: registra cada corrección automática
- ✅ **Sin intervención manual**: el usuario no tiene que hacer nada

### 3. Mensaje de Error Descriptivo

El error ahora incluye:

- ✅ ID del producto
- ✅ Descripción del producto
- ✅ Business ID
- ✅ Tipo de stock log
- ✅ Datos completos del item
- ✅ Posibles causas
- ✅ Sugerencias de solución

## 🛠️ Cómo Resolver

### Opción 1: Marcar como "new" (Recomendado)

Si el producto realmente no existe, márcalo como "new":

```javascript
{
  uuid: "f91eacba-c062-4740-b083-614b2f6f6923",
  description: "Producto X",
  oldOrNewProduct: "new",  // ✅ Correcto
  quantity: 5,
  price: 10.00,
  unit: "uni"
}
```

### Opción 2: Verificar que el producto exista

Antes de marcar como "old", verifica que exista:

```javascript
const { getProductById } = useInventory();

const product = await getProductById(productId);

if (product) {
  item.oldOrNewProduct = "old"; // ✅ Existe
} else {
  item.oldOrNewProduct = "new"; // ✅ No existe, debe crearse
}
```

### Opción 3: Crear el producto manualmente primero

```javascript
const { createItem } = useInventory();

// Crear el producto primero
await createItem({
  uuid: "f91eacba-c062-4740-b083-614b2f6f6923",
  description: "Producto X",
  price: 10.0,
  cost: 5.0,
  stock: 0,
  unit: "uni",
});

// Ahora puede usarse como "old"
item.oldOrNewProduct = "old";
```

## 📊 Flujo Correcto

### Para Productos Nuevos:

```
Usuario ingresa producto ➜
  oldOrNewProduct = "new" ➜
    addItemToInventoryFromArryOfItemsNewOrOld() ➜
      createItem() [✅ Crea en Firestore] ➜
        addTransaction() ➜
          createStockLog() [✅ Producto existe]
```

### Para Productos Existentes:

```
Usuario selecciona producto existente ➜
  oldOrNewProduct = "old" ➜
    addItemToInventoryFromArryOfItemsNewOrOld() ➜
      [⏭️ Skip, ya existe] ➜
        addTransaction() ➜
          createStockLog() [✅ Producto existe]
```

### Flujo Problemático (Error):

```
Usuario ingresa producto ➜
  oldOrNewProduct = "old" [❌ ERROR: marcado mal] ➜
    addItemToInventoryFromArryOfItemsNewOrOld() ➜
      [⏭️ Skip] ➜
        addTransaction() ➜
          createStockLog() [❌ FALLA: Producto NO existe]
```

## 🔍 Debugging

Si ves este error, revisa los logs en consola:

```javascript
❌ Error: El producto no existe en Firestore
{
  productId: "f91eacba-c062-4740-b083-614b2f6f6923",
  businessId: "TIENDA-39e155bf",
  productDescription: "Producto X",
  typeStockLog: "sell",
  itemData: { /* datos completos del item */ }
}
```

Esto te dirá:

1. **Qué producto** no existe
2. **En qué negocio** se buscó
3. **Qué operación** se intentó hacer
4. **Qué datos** se estaban usando

## ⚠️ Prevención (Ya No Necesario - Auto-Corrección Activa)

> **Nota**: Con la nueva auto-corrección implementada en `addItemToInventoryFromArryOfItemsNewOrOld()`, estas validaciones manuales **ya no son necesarias**. El sistema detecta y corrige automáticamente productos "old" que no existen.

### ~~En el autocomplete de productos~~ (Opcional):

```javascript
const handleProductSelect = (product) => {
  if (product.isExistingProduct) {
    // Producto existente en Firestore
    item.uuid = product.uuid;
    item.oldOrNewProduct = "old";
  } else {
    // Producto nuevo
    item.uuid = uuidv4();
    item.oldOrNewProduct = "new";
  }
};
```

### ~~En el flujo de transacciones~~ (Ya Implementado):

```javascript
// ✅ Ya implementado en addItemToInventoryFromArryOfItemsNewOrOld()
// Valida automáticamente antes de agregar a la transacción
const validateProduct = async (item) => {
  if (item.oldOrNewProduct === "old") {
    const exists = await getProductById(item.uuid);
    if (!exists) {
      console.warn(`Producto ${item.uuid} marcado como "old" pero no existe`);
      item.oldOrNewProduct = "new"; // ✅ Auto-corrección
    }
  }
};
```

```javascript
const handleProductSelect = (product) => {
  if (product.isExistingProduct) {
    // Producto existente en Firestore
    item.uuid = product.uuid;
    item.oldOrNewProduct = "old";
  } else {
    // Producto nuevo
    item.uuid = uuidv4();
    item.oldOrNewProduct = "new";
  }
};
```

### En el flujo de transacciones:

```javascript
// Validar antes de agregar a la transacción
const validateProduct = async (item) => {
  if (item.oldOrNewProduct === "old") {
    const exists = await getProductById(item.uuid);
    if (!exists) {
      console.warn(`Producto ${item.uuid} marcado como "old" pero no existe`);
      item.oldOrNewProduct = "new";
    }
  }
};
```

## ✅ Testing

Después de esta corrección:

- [x] **Auto-corrección activa**: Productos "old" que no existen se convierten automáticamente a "new"
- [x] **Validación en `createStockLog()`**: Verifica existencia antes de actualizar
- [x] **Error muestra información clara** del producto faltante
- [x] **Se identifica el business y el producto** específico
- [x] **Se sugieren soluciones concretas**
- [x] **Trazabilidad completa**: Cada corrección queda registrada
- [x] **Prevención proactiva**: El error se evita antes de que ocurra

## 📋 Resumen de Cambios

### Archivos Modificados:

1. **`src/composables/useInventory.js`**

   - ✅ Agregada validación en `createStockLog()` para verificar existencia de producto
   - ✅ Mensaje de error descriptivo con información de debugging

2. **`src/stores/inventoryStore.js`** ⭐ PRINCIPAL
   - ✅ **Auto-corrección en `addItemToInventoryFromArryOfItemsNewOrOld()`**
   - ✅ Verifica productos "old" con `getProductById()`
   - ✅ Convierte automáticamente "old" → "new" si no existe
   - ✅ Registra la corrección en trazabilidad

### Comportamiento Actual:

```
Producto marcado como "old" ➜
  Verificación con getProductById() ➜
    ¿Existe?
      ✅ SÍ → Mantener como "old", skip creación
      ❌ NO → Auto-convertir a "new" + crear producto
```

### Ventajas:

- 🚀 **Solución automática**: Sin intervención del usuario
- 🔍 **Detección temprana**: Antes de crear el stockLog
- 📝 **Trazabilidad completa**: Cada corrección queda registrada
- 🛡️ **Integridad de datos**: Garantiza que todos los productos existan
- ⚡ **Sin errores**: Elimina el "NOT_FOUND: no entity to update"

---

**Fecha**: 16 de enero de 2025  
**Tipo**: Error de validación + Auto-corrección  
**Estado**: ✅ Resuelto con auto-corrección automática
