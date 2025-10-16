# Sistema de Remoción de Stock - Documentación

## Resumen

Se ha implementado un sistema completo para gestionar las salidas de inventario (ventas y mermas) siguiendo la arquitectura establecida en el proyecto, similar a `AccountBalanceAppWrapper.vue`.

## Estructura de Archivos Creados

### 1. Store - RemoveStockFlow.js

**Ubicación:** `src/stores/Inventory/RemoveStockFlow.js`

**Funcionalidad:**

- Maneja el flujo completo de remoción de stock
- Define pasos dinámicos según el tipo de salida (venta o merma)
- Almacena datos del producto y de la operación
- Gestiona validaciones para avanzar entre pasos

**Estados principales:**

```javascript
{
  currentStep: 0,
  steps: [...],
  removeStockData: {
    productId,
    productData,
    stockLogType, // 'sell' o 'waste'
    quantity,
    price,
    priceConfirmed,
    account // 'cash' o 'bank' (solo para ventas)
  }
}
```

**Flujo de pasos:**

1. **Para VENTAS (`sell`):**
   - Tipo de salida → Cantidad → Método de pago → Preview
2. **Para MERMAS (`waste`):**
   - Tipo de salida → Cantidad → Preview

### 2. Vista Principal - RemoveStock.vue

**Ubicación:** `src/views/Inventory/RemoveStock.vue`

**Características:**

- Carga los datos del producto desde Firestore
- Muestra información del producto (stock actual, precio)
- Renderiza componentes dinámicos según el paso actual
- Maneja la finalización del registro
- Integra ProgressIndicator, CloseBtn y BackBtn

**Flujo de finalización:**

- **Venta:** Prepara `transactionToAdd` con el item y ejecuta `addTransaction()`
- **Merma:** Crea directamente un stock log con tipo 'waste'

### 3. Componentes de Pasos

#### StepRemoveStockType.vue

**Ubicación:** `src/components/Inventory/StockLogs/StepRemoveStockType.vue`

**Funcionalidad:**

- Presenta dos opciones: Venta o Merma
- Al seleccionar, define los pasos dinámicos del flujo
- Avanza automáticamente al siguiente paso

#### StepRemoveStockQuantity.vue

**Ubicación:** `src/components/Inventory/StockLogs/StepRemoveStockQuantity.vue`

**Funcionalidad:**

- Input de cantidad con validación de stock disponible
- Para ventas: muestra y permite editar el precio
- Validación en tiempo real
- Muestra resumen con cálculo del total (para ventas)
- Botón de continuar solo habilitado con datos válidos

**Validaciones:**

- Cantidad > 0
- Cantidad ≤ stock disponible
- Precio > 0 (solo para ventas)

#### StepRemoveStockPreview.vue

**Ubicación:** `src/components/Inventory/StockLogs/StepRemoveStockPreview.vue`

**Funcionalidad:**

- Resumen completo de la operación
- Muestra tipo de salida y método de pago (ventas)
- Detalle del producto con cantidad y precio
- Cálculo del stock resultante
- Nota informativa según el tipo de operación

### 4. Componente de Navegación

#### NavigationBtnsRemoveStock.vue

**Ubicación:** `src/components/Inventory/StockLogs/NavigationBtnsRemoveStock.vue`

**Funcionalidad:**

- Botón "Volver" (excepto en el primer paso)
- Botón "Continuar" o "Finalizar" según el paso
- Validación de datos antes de permitir avanzar
- Estados de loading durante operaciones asíncronas
- Ejecuta `finalizarRegistro()` en el último paso

## Integraciones Realizadas

### 1. Actualización de StepCashOrBank.vue

Se hizo compatible con dos flujos:

- **TransactionFlow:** Flujo original de transacciones
- **RemoveStockFlow:** Nuevo flujo de remoción de stock

Detecta automáticamente en qué flujo está y actualiza el store correcto.

### 2. Actualización de NavigationBtnProductDetails.vue

Se implementó la función `handleEgresoAction()` que:

- Navega a la vista `RemoveStock`
- Pasa los parámetros `businessId` y `productId`

### 3. Configuración de useProgressIndicator.js

Se agregó el tipo de flujo:

```javascript
FLOW_TYPES.REMOVE_STOCK: {
  activeColor: 'bg-red-500',
  inactiveColor: 'bg-gray-200',
  counterBgColor: 'bg-red-50',
  counterTextColor: 'text-red-600'
}
```

### 4. Configuración de useCloseBtn.js

Se agregó configuración de reset:

```javascript
[FLOW_TYPES.REMOVE_STOCK]: {
  flowResets: ['resetFlow'],
  storeResets: ['resetTransactionToAdd'],
  description: 'Resetea el flow de remoción de stock'
}
```

### 5. Actualización de inventoryStore.js

Se modificó `addStockLogInInventory` para aceptar el parámetro `typeStockLog`:

```javascript
addStockLogInInventory(stockLog, (typeStockLog = "sell"));
```

## Flujo de Datos

### Caso: VENTA

1. Usuario selecciona "Venta" → `stockLogType = 'sell'`
2. Ingresa cantidad y confirma precio
3. Selecciona método de pago (Efectivo/Yape-Plin) → `account = 'cash'/'bank'`
4. Preview muestra resumen completo
5. Al finalizar:
   ```javascript
   transactionStore.transactionToAdd.value = {
     type: "income",
     account: "cash" | "bank",
     items: [{ uuid, description, quantity, price, unit }],
   };
   await transactionStore.addTransaction();
   ```

### Caso: MERMA

1. Usuario selecciona "Merma" → `stockLogType = 'waste'`
2. Ingresa cantidad (sin precio)
3. Preview muestra resumen
4. Al finalizar:
   ```javascript
   await inventoryStore.addStockLogInInventory(
     {
       uuid: productId,
       quantity: quantity,
     },
     "waste"
   );
   ```

## Rutas

La ruta ya existía en el router:

```javascript
{
  path: 'inventory/product/:productId/remove-stock',
  name: 'RemoveStock',
  component: () => import('@/views/Inventory/RemoveStock.vue')
}
```

## Trazabilidad

El sistema utiliza el sistema de trazabilidad existente:

- `inventoryStore.addStockLogInInventory()` registra logs con trazabilidad
- `transactionStore.addTransaction()` registra operaciones de venta

## Validaciones Implementadas

1. **Stock suficiente:** No permite salidas mayores al stock disponible
2. **Precio válido:** Para ventas, requiere precio > 0
3. **Cantidad válida:** Requiere cantidad > 0
4. **Método de pago:** Solo para ventas, requiere selección de cuenta

## Estados de UI

- **Loading:** Durante carga de producto y finalización
- **Error:** Si falla la carga o el registro
- **Success:** Redirige automáticamente a ProductDetails

## Mejoras Futuras Sugeridas

1. **Historial de salidas:** Mostrar últimas salidas del producto
2. **Confirmación de merma:** Agregar modal de confirmación para mermas
3. **Notas adicionales:** Permitir agregar notas a la salida
4. **Imágenes:** Opción de adjuntar foto del producto dañado (mermas)
5. **Reportes:** Generar reporte de mermas mensuales

## Testing Recomendado

1. ✅ Flujo completo de venta con efectivo
2. ✅ Flujo completo de venta con Yape/Plin
3. ✅ Flujo completo de merma
4. ✅ Validación de stock insuficiente
5. ✅ Validación de precio inválido
6. ✅ Botón "Volver" en cada paso
7. ✅ Botón "Cerrar" resetea todo
8. ✅ BackBtn vuelve a ProductDetails
9. ✅ Error en carga de producto
10. ✅ Error en finalización

## Convenciones Seguidas

- ✅ Estructura similar a `AccountBalanceAppWrapper.vue`
- ✅ Uso de Pinia stores
- ✅ Componentes reutilizables (ProgressIndicator, CloseBtn, BackBtn)
- ✅ Sistema de trazabilidad integrado
- ✅ Naming conventions del proyecto
- ✅ Estilos Tailwind CSS consistentes
- ✅ Iconos de @iconoir/vue

## Archivos Modificados

1. `src/components/transactionFlow/StepCashOrBank.vue`
2. `src/components/Inventory/ProductDetails/NavigationBtnProductDetails.vue`
3. `src/composables/useProgressIndicator.js`
4. `src/composables/useCloseBtn.js`
5. `src/stores/inventoryStore.js`

## Archivos Creados

1. `src/stores/Inventory/RemoveStockFlow.js`
2. `src/views/Inventory/RemoveStock.vue`
3. `src/components/Inventory/StockLogs/StepRemoveStockType.vue`
4. `src/components/Inventory/StockLogs/StepRemoveStockQuantity.vue`
5. `src/components/Inventory/StockLogs/StepRemoveStockPreview.vue`
6. `src/components/Inventory/StockLogs/NavigationBtnsRemoveStock.vue`

---

**Fecha de implementación:** 14 de octubre de 2025
**Desarrollado siguiendo:** Arquitectura de `AccountBalanceAppWrapper.vue` y patrones del proyecto
