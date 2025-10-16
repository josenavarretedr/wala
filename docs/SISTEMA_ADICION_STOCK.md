# 📦 Sistema de Adición de Stock - Documentación Completa

## 🎯 Visión General

El **Sistema de Adición de Stock** es un flujo completo para registrar compras de inventario, creado siguiendo el mismo patrón arquitectónico que el Sistema de Remoción de Stock. Este sistema:

- ✅ Registra compras de productos en el inventario
- ✅ Crea transacciones de tipo **expense** (gastos)
- ✅ Actualiza automáticamente el stock del producto
- ✅ Registra logs de inventario con tipo `'buy'`
- ✅ Soporta pagos en efectivo o banco
- ✅ Incluye sistema de trazabilidad completo

---

## 📊 Flujo de Usuario

```
1. Usuario hace clic en "INGRESO" desde ProductDetails
   ↓
2. StepAddStockQuantity: Ingresa cantidad y costo de compra
   ↓
3. StepCashOrBank: Selecciona método de pago (compartido con otros flows)
   ↓
4. StepAddStockPreview: Confirma los detalles de la compra
   ↓
5. Finalización: Se crea transaction de expense + stock log tipo 'buy'
```

---

## 🏗️ Arquitectura de Componentes

### 1️⃣ **AddStockFlow.js** (Store Pinia)

**Ubicación:** `src/stores/Inventory/AddStockFlow.js`

**Responsabilidad:** Orquesta el flujo de 3 pasos fijos

```javascript
{
  steps: [
    { id: 1, name: 'Cantidad y Costo', component: 'StepAddStockQuantity' },
    { id: 2, name: 'Método de Pago', component: 'StepCashOrBank' },
    { id: 3, name: 'Confirmación', component: 'StepAddStockPreview' }
  ],

  addStockData: {
    productId: null,
    productData: null,
    quantity: 0,
    cost: 0,              // Costo de compra por unidad
    priceConfirmed: false,
    account: null         // 'cash' o 'bank'
  }
}
```

**Validaciones por Paso:**

- **Paso 1:** `quantity > 0 && cost > 0 && priceConfirmed === true`
- **Paso 2:** `account !== null`
- **Paso 3:** Siempre puede proceder (solo confirmación)

---

### 2️⃣ **AddStock.vue** (Wrapper Principal)

**Ubicación:** `src/views/Inventory/AddStock.vue`

**Responsabilidad:** Contenedor principal con lógica de finalización

**Características Clave:**

```vue
<template>
  <!-- Card compacto del producto (gradiente verde) -->
  <div class="bg-gradient-to-br from-green-500 to-emerald-600">
    <Package />
    <!-- Ícono verde para compras -->
    <h3>{{ productData.description }}</h3>
  </div>

  <!-- ProgressIndicator con colores verdes -->
  <ProgressIndicator
    :currentStep="flow.currentStep - 1"
    :steps="flow.steps"
    activeColor="bg-green-500"
    counterBgColor="bg-green-50"
    counterTextColor="text-green-600"
  />

  <!-- Steps dinámicos -->
  <component :is="currentStepComponent" />

  <!-- Navegación bottom fixed -->
  <NavigationBtnsAddStock :finalizarRegistro="finalizarRegistro" />
</template>
```

**Lógica de Finalización:**

```javascript
const finalizarRegistro = async () => {
  // 1. Preparar transaction de expense
  const newTransaction = {
    type: "expense", // ❗ Tipo: gasto
    category: "materials", // Categoría: materiales/compras
    amount: quantity * cost, // Total de compra
    accountType: flow.addStockData.account,
    description: `Compra de ${quantity} ${productData.unit} de ${productData.description}`,
    date: new Date().toISOString(),
    businessId: businessId,
  };

  // 2. Crear transaction en Firestore
  await transactionStore.createTransaction(newTransaction);

  // 3. Crear stock log tipo 'buy'
  await inventoryStore.addStockLogInInventory(
    businessId,
    productId,
    quantity,
    "buy", // ❗ Tipo de log: compra
    flow.addStockData.account,
    cost
  );

  // 4. Actualizar stock del producto
  await inventoryStore.updateProductStock(
    businessId,
    productId,
    currentStock + quantity
  );

  // 5. Trazabilidad
  await logInventoryOperation("add_stock", productId, quantity);

  // 6. Navegar y limpiar
  router.push({ name: "ProductDetails" });
  flow.resetFlow();
};
```

---

### 3️⃣ **StepAddStockQuantity.vue**

**Ubicación:** `src/components/Inventory/StockLogs/StepAddStockQuantity.vue`

**Responsabilidad:** Captura cantidad y costo de compra

**UI/UX Destacable:**

```vue
<!-- Stock actual con badge verde -->
<div class="bg-green-50 border border-green-200">
  <Package class="text-white bg-green-500" />
  <span>Stock actual: {{ productData.stock }} uni</span>
</div>

<!-- Input de cantidad -->
<input
  v-model.number="quantity"
  type="number"
  step="0.01"
  @input="validateQuantity"
/>

<!-- Input de costo con referencia al precio de venta -->
<div class="bg-blue-50">
  <label>Costo de compra (precio unitario)</label>
  <input v-model.number="cost" type="number" step="0.01" />

  <div class="text-blue-700">
    Precio de venta actual: S/ {{ productData.price.toFixed(2) }}
  </div>
</div>

<!-- Resumen de compra -->
<div v-if="isValid">
  <div>Cantidad: {{ quantity }} uni</div>
  <div>Costo unitario: S/ {{ cost.toFixed(2) }}</div>
  <div>Total de compra: S/ {{ (quantity * cost).toFixed(2) }}</div>
  <div>Stock resultante: {{ getStockAfter() }} uni</div>
</div>
```

**Auto-save con watch():**

```javascript
watch(quantity, (newQuantity) => {
  flow.setQuantity(newQuantity);
});

watch(cost, (newCost) => {
  flow.setCost(newCost);
  flow.setPriceConfirmed(newCost > 0);
});
```

---

### 4️⃣ **StepCashOrBank.vue** (Componente Compartido)

**Ubicación:** `src/components/transactionFlow/StepCashOrBank.vue`

**Flow-Awareness:** Detecta automáticamente si está en AddStock

```javascript
const isAddStockFlow = computed(() => {
  return route.name === "AddStock";
});

const getCurrentAccount = () => {
  if (isAddStockFlow.value) {
    return useAddStockFlowStore().addStockData.account;
  }
  return transactionStore.transactionToAdd.accountType;
};
```

---

### 5️⃣ **StepAddStockPreview.vue**

**Ubicación:** `src/components/Inventory/StockLogs/StepAddStockPreview.vue`

**Responsabilidad:** Vista previa con confirmación final

```vue
<!-- Card del producto -->
<div class="bg-white border rounded-xl">
  <div class="bg-gradient-to-br from-green-500 to-emerald-600">
    <Package />
  </div>
  <div>
    <div>Cantidad comprada: {{ quantity }} uni</div>
    <div>Costo unitario: S/ {{ cost.toFixed(2) }}</div>
    <div>Stock actual: {{ productData.stock }} uni</div>
    <div>Stock después: {{ getStockAfter() }} uni</div>
  </div>
</div>

<!-- Método de pago -->
<div class="bg-blue-50">
  <Cash /> o <Bank />
  <span>{{ getPaymentMethodLabel() }}</span>
</div>

<!-- Total destacado -->
<div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
  <div>Total de compra</div>
  <div class="text-4xl font-bold">S/ {{ getTotalAmount() }}</div>
  <div>{{ quantity }} uni × S/ {{ cost.toFixed(2) }}</div>
</div>

<!-- Advertencia -->
<div class="bg-yellow-50">
  Esta acción registrará un gasto y aumentará el inventario
</div>
```

---

### 6️⃣ **NavigationBtnsAddStock.vue**

**Ubicación:** `src/components/Inventory/StockLogs/NavigationBtnsAddStock.vue`

**Responsabilidad:** Navegación bottom fixed con validación

```vue
<div class="fixed bottom-0 left-0 right-0 bg-white border-t">
  <!-- Botón Atrás (si no es primer paso) -->
  <button v-if="flow.currentStep > 1" @click="handleBack">
    <NavArrowLeft /> Atrás
  </button>

  <!-- Botón Continuar/Finalizar -->
  <button
    @click="handleNext"
    :disabled="!canProceed"
    :class="isLastStep 
      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
      : 'bg-gradient-to-r from-blue-500 to-blue-600'"
  >
    {{ isLastStep ? 'Finalizar compra' : 'Continuar' }}
    <Check v-if="isLastStep" />
    <NavArrowRight v-else />
  </button>
</div>
```

```javascript
const handleNext = () => {
  if (isLastStep.value) {
    props.finalizarRegistro(); // Ejecuta la función del wrapper
  } else {
    flow.nextStep();
  }
};
```

---

## 🎨 Sistema de Colores

### Paleta Verde (Compras/Ingresos)

```css
/* Gradiente principal */
from-green-500 to-emerald-600

/* Badges y fondos */
bg-green-50    /* Fondo suave */
border-green-200
text-green-700

/* Botones activos */
bg-green-500
hover:from-green-600 hover:to-emerald-700

/* Progress Indicator */
activeColor: 'bg-green-500'
counterBgColor: 'bg-green-50'
counterTextColor: 'text-green-600'
```

---

## 🔗 Integración con Sistema Existente

### 1. Ruta de Navegación

```javascript
// src/router/index.js
{
  path: ':productId/add-stock',
  name: 'AddStock',
  component: () => import('@/views/Inventory/AddStock.vue')
}
```

### 2. Trigger desde ProductDetails

```javascript
// NavigationBtnProductDetails.vue
const handleIngresoAction = () => {
  router.push({
    name: "AddStock",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};
```

### 3. Configuración en useProgressIndicator.js

```javascript
export const FLOW_TYPES = {
  ADD_STOCK: "add_stock",
  // ...
};

export const FLOW_COLORS = {
  [FLOW_TYPES.ADD_STOCK]: {
    activeColor: "bg-green-500",
    inactiveColor: "bg-gray-200",
    counterBgColor: "bg-green-50",
    counterTextColor: "text-green-600",
  },
};
```

### 4. Reset Configuration en useCloseBtn.js

```javascript
export const FLOW_RESET_CONFIGS = {
  [FLOW_TYPES.ADD_STOCK]: {
    flowResets: ["resetFlow"],
    storeResets: ["resetTransactionToAdd"],
    description: "Resetea el flow de adición de stock",
  },
};
```

---

## 📝 Diferencias con RemoveStock

| Característica          | RemoveStock              | AddStock             |
| ----------------------- | ------------------------ | -------------------- |
| **Tipo de Transacción** | `income` (ventas)        | `expense` (compras)  |
| **Categoría**           | `sales`                  | `materials`          |
| **Tipo de Stock Log**   | `'sell'` o `'waste'`     | `'buy'`              |
| **Color Principal**     | Rojo                     | Verde                |
| **Steps Dinámicos**     | Sí (pago solo en ventas) | No (siempre 3 pasos) |
| **Cálculo Stock**       | `stock - quantity`       | `stock + quantity`   |
| **Ícono Gradiente**     | Rojo → Rosa              | Verde → Esmeralda    |
| **Validación Cantidad** | `quantity <= stock`      | Sin límite superior  |

---

## ✅ Checklist de Implementación

### Componentes

- ✅ AddStockFlow.js (Store Pinia)
- ✅ AddStock.vue (Wrapper)
- ✅ StepAddStockQuantity.vue
- ✅ StepAddStockPreview.vue
- ✅ NavigationBtnsAddStock.vue
- ✅ StepCashOrBank.vue (modificado para flow-awareness)

### Configuración

- ✅ Router: Ruta `AddStock` ya existente
- ✅ useProgressIndicator.js: `FLOW_TYPES.ADD_STOCK` + colores verdes
- ✅ useCloseBtn.js: `FLOW_RESET_CONFIGS.ADD_STOCK`
- ✅ NavigationBtnProductDetails.vue: `handleIngresoAction()` implementado

### Funcionalidad

- ✅ Crear transaction tipo expense
- ✅ Crear stock log tipo 'buy'
- ✅ Actualizar stock del producto
- ✅ Sistema de trazabilidad
- ✅ Auto-save con watch()
- ✅ Validaciones por paso

---

## 🧪 Casos de Prueba

### Test 1: Compra Básica con Efectivo

```
1. Navegar a ProductDetails de un producto
2. Clic en "INGRESO" (botón azul)
3. Ingresar cantidad: 10
4. Ingresar costo: 5.50
5. Verificar total: S/ 55.00
6. Seleccionar "Caja"
7. Confirmar en preview
8. ✅ Verificar: transaction expense creada, stock aumentado +10
```

### Test 2: Compra con Banco

```
1. Similar al Test 1
2. En paso 2, seleccionar "Banco"
3. ✅ Verificar: accountType = 'bank'
```

### Test 3: Validación de Campos Vacíos

```
1. Intentar continuar sin ingresar cantidad
2. ✅ Botón "Continuar" deshabilitado
3. Ingresar cantidad sin costo
4. ✅ Botón "Continuar" sigue deshabilitado
```

### Test 4: Cálculo de Stock Resultante

```
1. Producto con stock actual: 50
2. Comprar cantidad: 25
3. ✅ Stock resultante mostrado: 75
4. ✅ Después de finalizar, productData.stock = 75
```

---

## 🎯 Próximos Pasos

### Mejoras Futuras

- [ ] Agregar campo de proveedor en la compra
- [ ] Permitir editar precio de venta después de compra
- [ ] Historial de compras por producto
- [ ] Cálculo automático de margen de ganancia
- [ ] Alertas de stock bajo después de compras

### Integración con Otros Sistemas

- [ ] Dashboard: Widget de "Compras Recientes"
- [ ] Reportes: Reporte de compras por período
- [ ] Inventario: Botón "Última Compra" en ProductDetails

---

## 📚 Referencias

- **Sistema de Remoción de Stock:** `docs/SISTEMA_REMOCION_STOCK.md`
- **Account Balance Wrapper:** `src/views/AccountsBalance/AccountBalanceAppWrapper.vue`
- **Arquitectura Coherente:** `docs/ARQUITECTURA_COHERENTE.md`
- **Sistema Multi-Negocio:** `docs/SISTEMA_MULTI_NEGOCIO.md`

---

**✨ Sistema implementado siguiendo los estándares arquitectónicos del proyecto Wala**

_Última actualización: 2024_
