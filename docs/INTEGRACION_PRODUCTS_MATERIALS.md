# 📦 Integración de Products Collection para Materials

## 🎯 Problema Resuelto

### Situación Anterior

Cuando se registraba una transacción de expense con materials, el sistema:

- ✅ Creaba/actualizaba registros en la colección `expenses`
- ❌ **NO creaba productos en la colección `products`**
- ❌ **NO creaba stockLogs para el control de inventario**

Esto causaba una desconexión entre los gastos registrados y el inventario real.

### Solución Implementada

Ahora el flujo completo es:

1. ✅ Se procesa la transacción de expense
2. ✅ Se crean/actualizan productos en `products`
3. ✅ Se crean stockLogs con `type: 'buy'`
4. ✅ Se actualiza el stock automáticamente
5. ✅ Se vinculan los stockLogIds a los materialItems

---

## 🔧 Cambios Implementados

### Archivo: `transactionStore.js`

**Ubicación:** Líneas 142-175 (aproximadamente)

**Antes:**

```javascript
if (transactionToAdd.value.category === "materials") {
  const materialTotal = (transactionToAdd.value.materialItems || []).reduce(
    (sum, material) => {
      return sum + (material.cost || 0) * (material.quantity || 0);
    },
    0
  );
  // ... solo procesaba expenses
}
```

**Después:**

```javascript
if (transactionToAdd.value.category === "materials") {
  // 🛒 GESTIÓN DE INVENTARIO: Procesar materials en la colección 'products'
  console.log("🛒 Iniciando procesamiento de materials en inventario...");

  // Llamar a inventoryStore para crear/actualizar productos y stockLogs
  const materialStockLogMap =
    await inventoryStore.addMaterialItemsToInventoryForPurchase(
      transactionToAdd.value.materialItems
    );

  // Actualizar materialItems con los stockLogIds generados
  if (materialStockLogMap && materialStockLogMap.length > 0) {
    transactionToAdd.value.materialItems =
      transactionToAdd.value.materialItems.map((material) => {
        const mapping = materialStockLogMap.find(
          (m) => m.materialUuid === material.uuid
        );
        if (mapping) {
          return {
            ...material,
            stockLogId: mapping.stockLogId,
          };
        }
        return material;
      });

    console.log(
      "✅ Materials procesados en inventario con stockLogIds:",
      materialStockLogMap
    );
  }

  // Continúa con el cálculo del total y procesamiento de expense...
}
```

---

## 🗄️ Estructura de Datos

### Colección: `products`

**Ruta:** `businesses/{businessId}/products/{productId}`

**Campos principales:**

```javascript
{
  description: "CEMENTO PORTLAND X 42.5KG",
  price: 28.50,            // Precio de venta (puede actualizarse)
  cost: 28.50,             // Costo de compra (se actualiza con última compra)
  stock: 50,               // Cantidad disponible
  unit: "BOLSA",           // Unidad de medida
  type: "MERCH",           // Tipo: MERCH | RAW_MATERIAL | PRODUCT | SERVICE
  trackStock: true,        // Si se debe controlar stock
  createdAt: Timestamp,
  updatedAt: Timestamp,

  stockLog: [              // Array de movimientos de stock
    {
      uuid: "log-uuid-1",
      quantity: 50,
      type: "buy",         // buy | sell | waste | return | count
      cost: 28.50,
      totalCost: 1425.00,
      createdAt: Date,
      transactionId: "trans-uuid-1"
    },
    // ... más logs
  ]
}
```

---

## 🔄 Flujo Completo de Compra de Materials

### 1. Usuario agrega materials a la transacción

```javascript
// En NavigationBtnBARB.vue o similar
transactionStore.addMaterialToExpense({
  description: "CEMENTO PORTLAND X 42.5KG",
  quantity: 50,
  cost: 28.5,
  unit: "BOLSA",
  oldOrNewProduct: "new", // o "old" si ya existe
});
```

### 2. Al finalizar el registro

```javascript
// transactionStore.addTransaction() se ejecuta
// Detecta que es expense de materials
```

### 3. Procesamiento de inventario (NUEVO)

```javascript
// Se llama a inventoryStore.addMaterialItemsToInventoryForPurchase()
// Para cada material:

// 3.1. Si es producto NUEVO:
await createItem(
  {
    uuid: productId,
    description: "CEMENTO PORTLAND X 42.5KG",
    price: 28.5,
    unit: "BOLSA",
    stock: 50,
    trackStock: true,
  },
  "MERCH"
);

// 3.2. Crear stockLog de compra:
await createStockLog(
  {
    uuid: productId,
    quantity: 50,
    type: "buy",
    cost: 28.5,
    transactionId: transactionUuid,
  },
  "buy"
);

// 3.3. Actualizar stock automáticamente:
// stock anterior + cantidad comprada = stock nuevo
```

### 4. Procesamiento de expense (existente)

```javascript
// Se crea/actualiza el expense en la colección expenses
// Se agrega el log con la información de la compra
// Se incluyen los materialItems con stockLogIds
```

### 5. Resultado final

**Colecciones actualizadas:**

- ✅ `transactions` - Transacción registrada
- ✅ `expenses` - Expense/log de gasto creado
- ✅ `products` - Productos creados/actualizados
- ✅ `products.stockLog` - Logs de movimiento de stock
- ✅ `traceability` - Logs de trazabilidad

**Vinculaciones:**

```javascript
transaction.uuid → expense.logs[].transactionRef
transaction.uuid → products.stockLog[].transactionId
expense.logs[].materialItems[].stockLogId → products.stockLog[].uuid
```

---

## 📊 Nomenclatura de la Colección "products"

### ❓ ¿Es "products" el mejor nombre?

**Análisis realizado:**

| Opción          | Pros                                                                                                                               | Contras                                                       | Calificación             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------ |
| **products** ✅ | • Estándar de la industria<br>• Internacionalmente reconocido<br>• Soporta múltiples tipos (mercancía, materias primas, servicios) | • Puede confundir que incluye servicios                       | ⭐⭐⭐⭐ **RECOMENDADO** |
| `inventory`     | • Claro para control de stock<br>• Enfocado en gestión                                                                             | • No incluye servicios sin stock<br>• Semánticamente limitado | ⭐⭐⭐                   |
| `items`         | • Muy genérico<br>• Incluye todo                                                                                                   | • Demasiado vago<br>• Poco descriptivo                        | ⭐⭐                     |
| `catalog`       | • Implica listado organizado<br>• Incluye productos y servicios                                                                    | • Puede confundirse con catálogo de ventas                    | ⭐⭐⭐                   |

### ✅ Recomendación: **Mantener "products"**

**Razones:**

1. **Estándar de la industria:** Shopify, WooCommerce, BigCommerce, Stripe, etc. usan "products"
2. **Semántica amplia:** En contextos de negocio, "producto" puede ser tangible o intangible
3. **Diferenciación por tipo:** El campo `type` permite clasificar:
   - `MERCH` - Mercancía para venta
   - `RAW_MATERIAL` - Materia prima / insumos
   - `PRODUCT` - Producto elaborado
   - `SERVICE` - Servicios
4. **Ya implementado:** Cambiar requeriría migración de datos
5. **Documentación clara:** Con buena documentación, no hay confusión

### 🏷️ Tipos de Productos Soportados

```javascript
// Ejemplos de cada tipo:

// MERCH - Mercancía para reventa
{
  description: "LAPTOP DELL INSPIRON 15",
  type: "MERCH",
  trackStock: true,
  stock: 10
}

// RAW_MATERIAL - Materias primas / insumos
{
  description: "CEMENTO PORTLAND X 42.5KG",
  type: "RAW_MATERIAL",
  trackStock: true,
  stock: 50
}

// PRODUCT - Producto elaborado
{
  description: "MUEBLE DE MADERA PERSONALIZADO",
  type: "PRODUCT",
  trackStock: true,
  stock: 3
}

// SERVICE - Servicios
{
  description: "CONSULTORÍA EMPRESARIAL",
  type: "SERVICE",
  trackStock: false,  // Los servicios no tienen stock
  stock: 0
}
```

---

## 🧪 Casos de Prueba

### Caso 1: Primera compra de material nuevo

**Input:**

```javascript
{
  description: "CLAVOS 3 PULGADAS",
  quantity: 5,
  cost: 6.50,
  unit: "KG",
  oldOrNewProduct: "new"
}
```

**Resultado esperado:**

1. ✅ Se crea producto en `products` con stock inicial de 5 KG
2. ✅ Se crea stockLog con `type: 'buy'` y `quantity: 5`
3. ✅ Se crea expense con el log correspondiente
4. ✅ Se vincula stockLogId al materialItem

### Caso 2: Compra adicional de material existente

**Input:**

```javascript
{
  description: "CLAVOS 3 PULGADAS",
  quantity: 10,
  cost: 6.00,
  unit: "KG",
  oldOrNewProduct: "old",
  selectedProductUuid: "existing-uuid"
}
```

**Resultado esperado:**

1. ✅ Se actualiza el producto existente
2. ✅ Se agrega nuevo stockLog con `type: 'buy'` y `quantity: 10`
3. ✅ Stock se actualiza: anterior + 10 = nuevo stock
4. ✅ Cost se actualiza al nuevo precio de compra (6.00)
5. ✅ Se agrega log al expense existente del año

### Caso 3: Compra múltiple de materials

**Input:**

```javascript
materialItems: [
  { description: "CEMENTO", quantity: 20, cost: 28.5, oldOrNewProduct: "new" },
  { description: "ARENA", quantity: 5, cost: 15.0, oldOrNewProduct: "new" },
  { description: "CLAVOS", quantity: 3, cost: 6.5, oldOrNewProduct: "old" },
];
```

**Resultado esperado:**

1. ✅ Se crean 2 productos nuevos (CEMENTO, ARENA)
2. ✅ Se actualiza 1 producto existente (CLAVOS)
3. ✅ Se crean 3 stockLogs (uno por cada material)
4. ✅ Se actualiza el expense con todos los materialItems
5. ✅ Total expense = (20×28.50) + (5×15.00) + (3×6.50) = 664.50

---

## 🔍 Validaciones Implementadas

### En `inventoryStore.js`

1. **Validación de productos "old" que no existen:**

```javascript
if (material.oldOrNewProduct === "old") {
  const productExists = await getProductById(productId);

  if (!productExists) {
    console.warn(
      '⚠️ Material marcado como "old" pero no existe. Convirtiendo a "new"'
    );
    material.oldOrNewProduct = "new";
  }
}
```

2. **Validación de stockLog antes de crear:**

```javascript
const productDoc = await getDoc(productRef);

if (!productDoc.exists()) {
  throw new Error(`El producto "${item.description}" no existe en Firestore`);
}
```

3. **Actualización automática de costo:**

```javascript
if (stockLog.type === "buy" && stockLog.cost !== undefined) {
  updateData.cost = Number(stockLog.cost);
  console.log(`💰 Actualizando costo del producto a: S/ ${stockLog.cost}`);
}
```

---

## 🎯 Beneficios de la Integración

### 1. **Inventario Automático**

- ✅ No se necesita registrar materials por separado
- ✅ El stock se actualiza automáticamente con las compras
- ✅ Se mantiene histórico completo de movimientos

### 2. **Trazabilidad Completa**

- ✅ Cada compra tiene su transacción, expense y stockLog
- ✅ Se puede rastrear desde la transacción hasta el stockLog
- ✅ Logs de trazabilidad automáticos para auditoría

### 3. **Consistencia de Datos**

- ✅ Una sola fuente de verdad para el inventario
- ✅ Sincronización automática entre expenses y products
- ✅ Validaciones que previenen inconsistencias

### 4. **Análisis Financiero**

- ✅ Costos de materials actualizados automáticamente
- ✅ Histórico de precios de compra
- ✅ Cálculo de rentabilidad por producto

### 5. **Control de Stock**

- ✅ Stock en tiempo real
- ✅ Alertas de stock bajo (futura implementación)
- ✅ Reportes de movimientos de inventario

---

## 📝 Notas Importantes

### ⚠️ Consideraciones

1. **Tipo de producto por defecto:**

   - Los materials se crean con `type: 'MERCH'` por defecto
   - Considerar agregar lógica para detectar si es `RAW_MATERIAL` basado en categoría

2. **Sincronización bidireccional:**

   - Actualmente: transacción → products ✅
   - Futuro: products → transacción (cuando se edite inventario directamente)

3. **Eliminación de transacciones:**
   - Si se elimina una transacción, considerar si se debe revertir el stockLog
   - Actualmente los stockLogs permanecen (enfoque de histórico inmutable)

### 🚀 Mejoras Futuras

1. **Campo `type` automático:**

```javascript
// Detectar tipo basado en categoría
const productType = category === "materials" ? "RAW_MATERIAL" : "MERCH";
```

2. **Soporte para edición de transacciones:**

```javascript
// Al editar una transacción, actualizar stockLogs correspondientes
```

3. **Reportes de inventario:**

```javascript
// Valorización de inventario
// Stock mínimo / máximo
// Rotación de inventario
```

4. **Integración con ventas:**

```javascript
// Al vender, verificar disponibilidad en products
// Sugerir materials/productos basados en stock
```

---

## 📚 Referencias

- **Archivo principal:** `src/stores/transaction/transactionStore.js`
- **Gestión de inventario:** `src/stores/inventoryStore.js`
- **Composable de inventario:** `src/composables/useInventory.js`
- **Composable de expenses:** `src/composables/useExpenses.js`

---

## ✅ Checklist de Implementación

- [x] Integrar llamada a `addMaterialItemsToInventoryForPurchase` en transactionStore
- [x] Actualizar materialItems con stockLogIds
- [x] Validar que no haya errores de sintaxis
- [x] Documentar el flujo completo
- [x] Analizar nomenclatura de "products"
- [x] Crear casos de prueba
- [ ] Probar en desarrollo con datos reales
- [ ] Verificar que stockLogs se crean correctamente
- [ ] Validar que el stock se actualiza
- [ ] Revisar logs de consola para debugging
- [ ] Hacer pruebas de rendimiento con múltiples materials

---

**Fecha de implementación:** 21 de noviembre de 2025
**Versión:** 1.0
**Estado:** ✅ Implementado y documentado
