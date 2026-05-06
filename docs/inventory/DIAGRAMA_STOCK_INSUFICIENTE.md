# Diagrama: Flujo de Stock Insuficiente

## Escenario: Vender 10 unidades con solo 5 en stock

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: Usuario ingresa cantidad                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Input: quantity = 10                                       │
│  Stock disponible: 5                                        │
│                                                             │
│  hasStockWarning = true ✅                                  │
│  Muestra: "⛔ La cantidad excede el stock disponible (5)"   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: Usuario marca "Proceder de todos modos"           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  proceedAnyway = true ✅                                    │
│  Botón "Agregar Producto" se habilita                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: handleAddProduct() pasa el flag                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  itemToAddInTransaction.proceedAnyway = true               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 4: addItemToTransaction() calcula                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  if (trackStock && proceedAnyway) {                         │
│    requestedQuantity = 10  // Lo que el usuario quiere     │
│    availableStock = 5      // Lo que hay                   │
│    actualQuantity = Math.min(10, 5) = 5                    │
│    quantityForStock = 5    // Para descontar del stock     │
│  }                                                          │
│                                                             │
│  Item guardado en transactionToAdd.items:                  │
│  {                                                          │
│    quantity: 10,             // Original del usuario       │
│    requestedQuantity: 10,    // Lo solicitado              │
│    actualQuantity: 5,        // Lo que se pudo vender      │
│    quantityForStock: 5,      // Para ajuste de stock       │
│    proceedAnyway: true       // Flag de confirmación       │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 5: Lista muestra el item con advertencia             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │ 🔶 Producto A                                     │     │
│  │ 10 uni × S/ 15.00                                 │     │
│  │ ⚠️ Stock insuficiente: Se vendió 5 de 10         │     │
│  │ solicitadas                                       │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 6: Al crear transacción - createStockLog()           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  itemWithTransaction = {                                    │
│    uuid: "prod-123",                                        │
│    quantity: 10,              // ✅ Lo que usuario ingresó │
│    quantityForStock: 5,       // Para updateStock()        │
│    price: 15.00,                                            │
│    transactionId: "trans-789"                               │
│  }                                                          │
│                                                             │
│  StockLog en Firestore:                                    │
│  {                                                          │
│    uuid: "log-456",                                         │
│    type: "sell",                                            │
│    quantity: 10,              // ✅ Registra la venta real │
│    price: 15.00,                                            │
│    transactionId: "trans-789",                              │
│    createdAt: "2025-10-18..."                               │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 7: updateStock() ajusta el inventario                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Parámetros recibidos:                                      │
│  - stockLog.quantity = 10  (del historial)                  │
│  - quantityForStock = 5    (para ajustar)                   │
│                                                             │
│  Lógica:                                                    │
│  if (stockLog.type === 'sell') {                            │
│    quantityToDeduct = quantityForStock ?? stockLog.quantity│
│    // quantityToDeduct = 5                                  │
│                                                             │
│    if (quantityToDeduct > itemData.stock) {                 │
│      newStock = 0;  // No puede ser negativo                │
│    } else {                                                 │
│      newStock = itemData.stock - quantityToDeduct;          │
│      // newStock = 5 - 5 = 0                                │
│    }                                                        │
│  }                                                          │
│                                                             │
│  Stock en Firestore:                                        │
│  {                                                          │
│    stock: 0,                  // ✅ Ajustado correctamente  │
│    stockLog: [                                              │
│      {                                                      │
│        quantity: 10,          // Venta completa             │
│        type: "sell"                                         │
│      }                                                      │
│    ]                                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  RESULTADO FINAL                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Historial de Movimientos muestra: -10 uni              │
│     (La venta completa que el usuario hizo)                │
│                                                             │
│  ✅ Stock actual: 0 unidades                                │
│     (Se descontaron solo las 5 disponibles)                │
│                                                             │
│  ✅ Análisis de ventas: 10 unidades vendidas                │
│     (Datos reales para reportes)                           │
│                                                             │
│  ✅ Inventario protegido: No hay stock negativo            │
│     (Math.min garantiza el límite)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Comparación: Antes vs. Ahora

### ❌ Antes (Incorrecto)

```
Usuario vende 10 con stock 5:
├─ StockLog.quantity = 5  ❌ (perdíamos info de venta real)
├─ Stock final = 0
└─ Historial muestra: -5 uni  ❌ (no refleja la venta real)
```

### ✅ Ahora (Correcto)

```
Usuario vende 10 con stock 5:
├─ StockLog.quantity = 10  ✅ (venta real para análisis)
├─ quantityForStock = 5    ✅ (para ajuste de inventario)
├─ Stock final = 0         ✅ (protegido, no negativo)
└─ Historial muestra: -10 uni  ✅ (refleja venta completa)
```

## Flujo de Datos Simplificado

```
INPUT              PROCESSING          STOCKLOG        STOCK UPDATE
(Usuario)          (Store)             (Firestore)     (Firestore)

quantity: 10  →    if proceedAnyway → quantity: 10  →  quantityToDeduct: 5
                   ├─ requested: 10                   ├─ stock: 5
                   ├─ actual: 5                       └─ newStock: 0
                   └─ forStock: 5
```

## Ventajas del Sistema Actual

1. **Historial Completo**: StockLog siempre tiene la cantidad real vendida
2. **Análisis Preciso**: Los reportes de ventas reflejan la realidad
3. **Inventario Protegido**: Stock nunca puede ser negativo
4. **Trazabilidad**: Se puede ver qué se vendió vs. qué se descontó
5. **Flexibilidad**: Permite ventas urgentes sin perder datos

## Ejemplo Real

### Escenario: Negocio de Comida

```
Producto: Pizza Margherita
Stock inicial: 3 pizzas

Cliente 1: Quiere 2 pizzas
├─ Stock suficiente ✅
├─ StockLog: -2 pizzas
└─ Stock final: 1 pizza

Cliente 2: Quiere 5 pizzas (para un evento)
├─ Stock insuficiente (solo 1 disponible) ⚠️
├─ Dueño marca "Proceder de todos modos"
├─ StockLog registra: -5 pizzas  ✅ (venta real)
├─ Stock se descuenta: 1 pizza
├─ Stock final: 0 pizzas
└─ Sistema muestra: "Se vendió 1 de 5 solicitadas"

Beneficio:
- El historial muestra venta de 7 pizzas (2+5)
- El inventario queda en 0 (no negativo)
- El dueño puede analizar demanda insatisfecha
- Los reportes de ventas son precisos
```

## Logs de Consola

### Momento del Agregado

```javascript
📊 Agregando item con stock insuficiente: {
  descripcion: "Pizza Margherita",
  cantidadSolicitada: 5,
  stockDisponible: 1,
  cantidadReal: 1,
  stockFinal: 0
}
```

### Momento de la Transacción

```javascript
⚠️ Venta con stock insuficiente: {
  producto: "Pizza Margherita",
  cantidadSolicitada: 5,
  cantidadRealDescontada: 1,
  stockDisponible: 1,
  mensaje: 'StockLog registrará la cantidad solicitada, pero el stock solo se reducirá según disponibilidad'
}
```

### Momento del Update Stock

```javascript
⚠️ Cantidad a deducir mayor al stock disponible: {
  cantidadSolicitada: 5,
  cantidadADeducir: 1,
  stockDisponible: 1,
  stockFinal: 0
}
```


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

