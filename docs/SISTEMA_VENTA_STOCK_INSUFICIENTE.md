# Sistema de Venta con Stock Insuficiente

## Descripción General

Sistema implementado para permitir ventas de productos incluso cuando el stock disponible es menor a la cantidad solicitada, con registro correcto en `stockLog` y control inteligente del stock final.

## Flujo de Funcionamiento

### 1. Detección de Stock Insuficiente

En `StepAddIncomeDetails.vue`, cuando el usuario intenta vender más unidades de las disponibles:

```vue
const hasStockWarning = computed(() => { const item =
transactionStore.itemToAddInTransaction.value; // Solo aplica si trackStock =
true if (!item.trackStock) return false; const quantity =
parseFloat(item.quantity) || 0; const stock = parseFloat(item.stock) || 0;
return quantity > stock; // Advertencia si excede });
```

### 2. Checkbox "Proceder de Todos Modos"

Si hay advertencia de stock, se muestra un checkbox:

```vue
<div v-if="hasStockWarning" class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
  <label class="flex items-start gap-3 cursor-pointer group">
    <input v-model="proceedAnyway" type="checkbox" />
    <div class="flex-1">
      <span>Proceder de todos modos</span>
      <p class="text-xs">
        Acepto vender esta cantidad aunque exceda el stock disponible.
        Esto puede generar stock negativo.
      </p>
    </div>
  </label>
</div>
```

### 3. Validación del Botón "Agregar"

El botón solo se habilita si:

- Hay descripción, cantidad, precio y unidad
- NO hay advertencia de stock, O
- Hay advertencia pero se marcó "proceder de todos modos"

```javascript
const canAddProduct = computed(() => {
  if (!item.description || !item.quantity || !item.price || !item.unit) {
    return false;
  }

  // Bloquear si hay advertencia y NO se marcó "proceder"
  if (hasStockWarning.value && !proceedAnyway.value) {
    return false;
  }

  return true;
});
```

### 4. Lógica de Cálculo al Agregar Item

En `transactionStore.js`, función `addItemToTransaction()`:

```javascript
const addItemToTransaction = () => {
  const item = { ...itemToAddInTransaction.value };

  // Si el producto tiene seguimiento de stock y se marcó "proceder de todos modos"
  if (item.trackStock && item.proceedAnyway) {
    const requestedQuantity = parseFloat(item.quantity) || 0;
    const availableStock = parseFloat(item.stock) || 0;

    // Calcular la cantidad real que se puede vender
    const actualQuantity = Math.min(requestedQuantity, availableStock);

    // Guardar la cantidad solicitada original y la cantidad real
    item.requestedQuantity = requestedQuantity;
    item.actualQuantity = actualQuantity;

    // La cantidad que se registrará en el stock es la real
    item.quantityForStock = actualQuantity;
  }

  transactionToAdd.value.items.push(item);
};
```

### 5. Registro del StockLog

En `addTransaction()`, al procesar los items:

```javascript
for (const item of transactionToAdd.value.items) {
  // Crear stockLog con la cantidad solicitada (NO la ajustada)
  const itemWithTransaction = {
    ...item,
    transactionId: transactionToAdd.value.uuid,
    quantity: item.quantity, // SIEMPRE la cantidad que el usuario ingresó
    quantityForStock: item.quantityForStock, // Cantidad real para ajustar stock
  };

  // Log de advertencia si se vendió con stock insuficiente
  if (item.proceedAnyway && item.requestedQuantity > item.actualQuantity) {
    console.warn("⚠️ Venta con stock insuficiente:", {
      producto: item.description,
      cantidadSolicitada: item.requestedQuantity,
      cantidadRealDescontada: item.actualQuantity,
      stockDisponible: item.stock,
      mensaje:
        "StockLog registrará la cantidad solicitada, pero el stock solo se reducirá según disponibilidad",
    });
  }

  await createStockLog(itemWithTransaction);
}
```

### 6. Actualización del Stock

En `useInventory.js`, función `updateStock()`:

```javascript
const updateStock = async (
  productRef,
  stockLog,
  quantityForStock = undefined
) => {
  const itemDoc = await getDoc(productRef);
  const itemData = itemDoc.data();

  if (stockLog.type === "sell" || stockLog.type === "waste") {
    // Usar quantityForStock si está disponible (venta con stock insuficiente)
    const quantityToDeduct =
      quantityForStock !== undefined ? quantityForStock : stockLog.quantity;

    // Stock nunca puede ser negativo
    if (quantityToDeduct > itemData.stock) {
      newStock = 0;
    } else {
      newStock = itemData.stock - quantityToDeduct;
    }
  }

  await updateDoc(productRef, { stock: newStock });
};
```

**Diferencia Clave:**

- `stockLog.quantity` = Lo que el usuario **quiso vender** (para historial y análisis)
- `quantityForStock` = Lo que **realmente se descuenta** del stock (limitado por disponibilidad)

## Casos de Uso

### Caso 1: Stock Suficiente (Normal)

- **Solicitud:** Vender 5 unidades
- **Stock:** 10 unidades
- **Resultado:**
  - Se vende 5 unidades
  - Stock final: 5 unidades
  - StockLog: type='sell', quantity=5

### Caso 2: Stock Insuficiente (Con "Proceder")

- **Solicitud:** Vender 10 unidades
- **Stock:** 5 unidades
- **Acción:** Marcar "Proceder de todos modos"
- **Resultado:**
  - **StockLog registra:** quantity=10 (lo que se intentó vender)
  - **Stock se descuenta:** 5 unidades (las disponibles)
  - **Stock final:** 0 unidades
  - **Visualización:** "-10 uni" (muestra la venta completa)
  - Se muestra advertencia en la lista: "⚠️ Stock insuficiente: Se vendió 5 de 10 solicitadas"

### Caso 3: Stock Cero (Con "Proceder")

- **Solicitud:** Vender 10 unidades
- **Stock:** 0 unidades
- **Acción:** Marcar "Proceder de todos modos"
- **Resultado:**
  - **StockLog registra:** quantity=10 (lo que se intentó vender)
  - **Stock se descuenta:** 0 unidades (nada disponible)
  - **Stock final:** 0 unidades (sin cambios)
  - **Visualización:** "-10 uni" (muestra la venta completa)
  - Se muestra advertencia: "⚠️ Stock insuficiente: Se vendió 0 de 10 solicitadas"
  - StockLog: type='sell', quantity=0 (registro histórico sin impacto)
  - Se muestra advertencia: "⚠️ Stock insuficiente: Se vendió 0 de 10 solicitadas"

### Caso 4: Producto sin TrackStock (Servicios)

- **Solicitud:** Vender 100 unidades
- **Stock:** No aplica (trackStock=false)
- **Resultado:**
  - Se vende 100 unidades
  - No hay validación de stock
  - StockLog: No se crea (servicios no tienen seguimiento)

## Indicadores Visuales

### En el Input de Cantidad

**Normal:**

```
Input: border-gray-200
Indicador: bg-blue-500
```

**Con Advertencia:**

```
Input: border-red-300 bg-red-50
Indicador: bg-red-500
Mensaje: "⛔ La cantidad excede el stock disponible (5 uni)"
```

**Con Advertencia pero Marcado "Proceder":**

```
Input: border-gray-200 (vuelve a normal)
Indicador: bg-blue-500
Checkbox: Visible y marcado
```

### En la Lista de Productos Agregados

**Normal:**

```html
<div class="bg-gray-50 rounded-xl p-4">
  <div>Producto X</div>
  <div>10 uni × S/ 5.00</div>
</div>
```

**Con Stock Insuficiente:**

```html
<div class="bg-amber-50 rounded-xl p-4 border-2 border-amber-300">
  <div>Producto X</div>
  <div>10 uni × S/ 5.00</div>
  <div class="text-amber-700">
    ⚠️ Stock insuficiente: Se vendió 5 de 10 solicitadas
  </div>
</div>
```

## Estructura de Datos

### itemToAddInTransaction

```javascript
{
  description: "Producto A",
  quantity: 10,              // Cantidad en el formulario
  price: 15.50,
  unit: "uni",
  stock: 5,                  // Stock disponible actual
  trackStock: true,          // Si tiene seguimiento
  proceedAnyway: true,       // Si marcó el checkbox

  // Campos adicionales cuando proceedAnyway = true:
  requestedQuantity: 10,     // Lo que pidió originalmente
  actualQuantity: 5,         // Lo que realmente se puede vender
  quantityForStock: 5        // Lo que se restará del stock
}
```

### Item en transactionToAdd.items

```javascript
{
  ...itemToAddInTransaction,
  uuid: "abc-123",
  oldOrNewProduct: "old",
  selectedProductUuid: "prod-456",
  transactionId: "trans-789"
}
```

## Funciones de useInventory Utilizadas

### createStockLog()

```javascript
await createStockLog({
  uuid: productUuid,
  quantity: quantityForStockUpdate, // Usa la cantidad real
  price: item.price,
  cost: item.cost,
  transactionId: transactionUuid,
  // typeStockLog = 'sell' (por defecto en transacciones de ingreso)
});
```

### updateStock() (llamada internamente por createStockLog)

```javascript
// Para type: 'sell'
newStock = itemData.stock - stockLog.quantity;

// Si stock actual = 5 y quantity = 5
// newStock = 0 ✅

// Si stock actual = 0 y quantity = 0
// newStock = 0 ✅ (no cambia)
```

## Beneficios de esta Implementación

1. **Registro Histórico Completo**: Todos los intentos de venta quedan registrados en stockLog
2. **Stock Nunca Negativo**: Math.min() garantiza que nunca se venda más de lo disponible
3. **Transparencia**: El usuario ve exactamente qué cantidad se vendió vs. lo solicitado
4. **Trazabilidad**: Los logs muestran advertencias cuando hay discrepancias
5. **Flexibilidad**: Permite procesar ventas urgentes sin bloquear el sistema
6. **Seguridad**: Requiere confirmación explícita del usuario para proceder

## Logs de Consola

```javascript
// Al agregar item con stock insuficiente:
📊 Agregando item con stock insuficiente: {
  descripcion: "Producto A",
  cantidadSolicitada: 10,
  stockDisponible: 5,
  cantidadReal: 5,
  stockFinal: 0
}

// Al crear la transacción:
⚠️ Venta con stock insuficiente: {
  producto: "Producto A",
  cantidadSolicitada: 10,
  cantidadVendida: 5,
  stockDisponible: 5
}
```

## Notas Técnicas

- El checkbox `proceedAnyway` es local al componente y se resetea después de agregar
- El flag `proceedAnyway` del item se mantiene en el array de items hasta que se completa la transacción
- La validación de stock solo aplica a productos con `trackStock = true`
- Los servicios y productos sin seguimiento no pasan por esta validación
- El campo `quantityForStock` solo existe cuando hay stock insuficiente y se procede


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

