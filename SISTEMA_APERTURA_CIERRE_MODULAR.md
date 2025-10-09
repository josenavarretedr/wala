# Sistema de Apertura/Cierre Modular - Implementación Completa

## 📋 Resumen de Cambios

Se ha implementado un sistema modular completo para realizar aperturas y cierres de caja usando la arquitectura de flujo por pasos (steps) con stores centralizados.

## 🏗️ Arquitectura Implementada

### 1. **accountsBalanceStore.js** - Store de Cálculos y Construcción

Se agregaron 4 nuevas funciones para construir transacciones de apertura/cierre:

#### Funciones Agregadas:

1. **`buildOpeningTransaction(params)`**

   - Construye la transacción de apertura completa
   - Parámetros:
     - `expectedCashBalance`: Balance esperado de efectivo
     - `expectedBankBalance`: Balance esperado de banco
     - `realCashBalance`: Balance real contado de efectivo
     - `realBankBalance`: Balance real contado de banco
     - `lastClosureUuid`: UUID del último cierre (opcional)
     - `generateUUID`: Función para generar UUIDs
   - Calcula automáticamente las diferencias (cashDifference, bankDifference)
   - Retorna objeto de transacción completo compatible con Firebase

2. **`buildOpeningAdjustments(params)`**

   - Construye array de transacciones de ajuste para apertura
   - Parámetros:
     - `cashDifference`: Diferencia en efectivo
     - `bankDifference`: Diferencia en banco
     - `generateUUID`: Función para generar UUIDs
   - Solo crea ajustes si la diferencia es significativa (> 0.01)
   - Diferencia positiva = Sobrante (income), negativa = Faltante (expense)
   - Categoría: `adjustment`, subcategoría: `opening_adjustment`

3. **`buildClosureTransaction(params)`**

   - Construye la transacción de cierre completa
   - Parámetros:
     - `openingUuid`: UUID de la apertura del día
     - `realCashBalance`: Balance real contado de efectivo
     - `realBankBalance`: Balance real contado de banco
     - `generateUUID`: Función para generar UUIDs
   - Usa `financialSummary` interno para obtener todos los datos del día
   - Incluye: totales de ingresos/egresos, saldos iniciales, balances esperados
   - Calcula diferencias automáticamente

4. **`buildClosureAdjustments(params)`**
   - Construye array de transacciones de ajuste para cierre
   - Parámetros:
     - `cashDifference`: Diferencia en efectivo
     - `bankDifference`: Diferencia en banco
     - `generateUUID`: Función para generar UUIDs
   - Categoría: `adjustment`, subcategoría: `closure_adjustment`

### 2. **accountsBalanceFlowStore.js** - Store de Flujo y Datos

#### Estado Agregado:

```javascript
stepsData: {
  lastClosureData: null,      // Datos del último cierre
  openingData: null,           // Datos de la apertura del día
  expectedCashBalance: 0,      // Balance esperado de efectivo
  expectedBankBalance: 0,      // Balance esperado de banco
  selectedCashOption: null,    // Opción seleccionada: 'expected' o 'custom'
  realCashBalance: 0,          // Balance real de efectivo
  selectedBankOption: null,    // Opción seleccionada: 'expected' o 'custom'
  realBankBalance: 0,          // Balance real de banco
}
```

#### Acción Agregada:

- **`updateStepData(stepLabel, data)`**: Actualiza los datos recopilados de cada step
- Llamado automáticamente por los componentes Step cuando cambian valores
- Permite que NavigationBtns acceda a todos los datos del flujo

### 3. **StepCashBalance.vue** - Componente Modular de Efectivo

#### Cambios:

- Importa `useAccountsBalanceFlowStore` y `watch` de Vue
- Agrega `watch` que observa cambios en:
  - `selectedCashOption`
  - `realCashBalance`
  - `expectedCashBalance`
- Actualiza automáticamente `flowStore.stepsData` cuando hay cambios
- Envía también `lastClosureData` y `openingData` para referencia

#### Datos que Sincroniza:

```javascript
{
  selectedCashOption: selectedCashOption.value,
  realCashBalance: realCashBalance.value,
  expectedCashBalance: expectedCashBalance.value,
  lastClosureData: lastClosureData.value,
  openingData: openingData.value,
}
```

### 4. **StepBankBalance.vue** - Componente Modular de Banco

#### Cambios:

- Mismo patrón que StepCashBalance
- Observa cambios en variables de banco
- Sincroniza con `flowStore.stepsData`

#### Datos que Sincroniza:

```javascript
{
  selectedBankOption: selectedBankOption.value,
  realBankBalance: realBankBalance.value,
  expectedBankBalance: expectedBankBalance.value,
}
```

### 5. **NavigationBtnsAccountsBalance.vue** - Lógica de Finalización

#### Refactorización Completa:

##### Imports Agregados:

```javascript
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { generateUUID } from "@/utils/generateUUID";
```

##### Validación Actualizada:

- `isNextButtonEnabled` ahora valida según los steps de apertura/cierre:
  - "Referencia anterior": Siempre habilitado
  - "Cash Balance": Requiere que `selectedCashOption !== null`
  - "Bank Balance": Requiere que `selectedBankOption !== null`

##### Función `finalizarRegistro()` - Completamente Reescrita:

**Detección de Modo:**

```javascript
const isOpeningMode = computed(() => {
  return !transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "opening"
  );
});
```

**Modo Apertura (Opening):**

1. Determina valores finales de cash y bank basados en la selección del usuario
2. Llama a `accountsBalanceStore.buildOpeningTransaction()` con los parámetros
3. Guarda la transacción de apertura en Firebase
4. Calcula diferencias usando `accountsBalanceStore.calculateDifference()`
5. Llama a `accountsBalanceStore.buildOpeningAdjustments()` para crear ajustes
6. Guarda cada transacción de ajuste secuencialmente

**Modo Cierre (Closure):**

1. Valida que exista `openingData` del día
2. Determina valores finales de cash y bank
3. Llama a `accountsBalanceStore.buildClosureTransaction()` con el UUID de apertura
4. Guarda la transacción de cierre en Firebase
5. Llama a `accountsBalanceStore.buildClosureAdjustments()` usando las diferencias del cierre
6. Guarda cada transacción de ajuste secuencialmente

**Finalización:**

- Resetea el flujo: `flow.resetFlow()`
- Limpia el store de transacciones: `transactionStore.resetTransactionToAdd()`
- Limpia el store de balance: `accountsBalanceStore.reset()`
- Redirige al dashboard del negocio

**Manejo de Errores:**

- Try-catch completo con mensajes contextuales
- Alert diferenciado según modo (apertura/cierre)
- Logging detallado en consola para debugging

## 🔄 Flujo de Datos Completo

### Apertura (Opening):

```
1. Usuario navega por los steps (StepLastReference → StepCashBalance → StepBankBalance)
2. Cada step sincroniza sus datos con accountsBalanceFlowStore.stepsData
3. Al presionar "Finalizar":
   ├─ NavigationBtnsAccountsBalance detecta modo = opening
   ├─ Obtiene datos de flowStore.stepsData
   ├─ Llama a accountsBalanceStore.buildOpeningTransaction()
   ├─ Guarda transacción de apertura
   ├─ Si hay diferencias:
   │  ├─ Llama a accountsBalanceStore.buildOpeningAdjustments()
   │  └─ Guarda cada ajuste secuencialmente
   └─ Resetea y redirige
```

### Cierre (Closure):

```
1. Usuario navega por los steps (StepLastReference → StepCashBalance → StepBankBalance)
2. Cada step sincroniza sus datos con accountsBalanceFlowStore.stepsData
3. Al presionar "Finalizar":
   ├─ NavigationBtnsAccountsBalance detecta modo = closure
   ├─ Obtiene datos de flowStore.stepsData
   ├─ Valida existencia de apertura del día
   ├─ Llama a accountsBalanceStore.buildClosureTransaction()
   ├─ Guarda transacción de cierre (incluye resumen financiero completo)
   ├─ Si hay diferencias:
   │  ├─ Llama a accountsBalanceStore.buildClosureAdjustments()
   │  └─ Guarda cada ajuste secuencialmente
   └─ Resetea y redirige
```

## ✅ Ventajas de la Arquitectura Implementada

1. **Modularidad Total**: Cada componente Step es independiente y reutilizable
2. **Carga Dinámica**: Los steps se cargan dinámicamente sin necesidad de props
3. **Cálculos Centralizados**: Todo el cálculo financiero está en accountsBalanceStore
4. **Consistencia**: Una única fuente de verdad para todos los cálculos
5. **Mantenibilidad**: Lógica de negocio separada de la UI
6. **Reusabilidad**: Las funciones build\* son reutilizables en cualquier contexto
7. **Testing**: Funciones puras fáciles de testear
8. **Logging Completo**: Trazabilidad detallada de cada operación

## 🔍 Compatibilidad con Código Existente

Todas las funciones construyen transacciones con la estructura exacta de:

- `AccountBalanceAppOpen.vue` (líneas 516-627)
- `AccountBalanceAppClose.vue` (líneas 629-745)

Campos incluidos:

- Apertura: `uuid`, `type`, `description`, `expectedCashBalance`, `expectedBankBalance`, `realCashBalance`, `realBankBalance`, `totalCash`, `totalBank`, `cashAmount`, `bankAmount`, `cashDifference`, `bankDifference`, `lastClosureReference`, `items`, `itemsAndStockLogs`, `amount`
- Cierre: Todos los anteriores + `openingReference`, `initialCashBalance`, `initialBankBalance`, `totalIngresos`, `totalEgresos`, `ingresosCash`, `ingresosBank`, `egresosCash`, `egresosBank`
- Ajustes: `uuid`, `type`, `account`, `description`, `amount`, `category`, `subcategory`, `isSystemGenerated`, `items`, `itemsAndStockLogs`

## 🧪 Testing Recomendado

1. **Apertura sin diferencias**: Balance esperado = Balance real
2. **Apertura con sobrante en efectivo**: realCash > expectedCash
3. **Apertura con faltante en banco**: realBank < expectedBank
4. **Cierre sin diferencias**: Balance esperado = Balance real
5. **Cierre con diferencias mixtas**: Sobrante en uno, faltante en otro
6. **Navegación hacia atrás**: Verificar que los datos persistan
7. **Modo disabled**: Verificar que no se pueda hacer doble apertura/cierre

## 📊 Estado Actual

✅ **COMPLETADO**:

- accountsBalanceStore con funciones build\*
- accountsBalanceFlowStore con stepsData
- StepCashBalance con sincronización automática
- StepBankBalance con sincronización automática
- NavigationBtnsAccountsBalance con lógica completa
- Manejo de errores y logging
- Compatibilidad con estructura Firebase existente

⏳ **PENDIENTE**:

- Testing de la implementación completa
- Validación en entorno de producción
- Posibles ajustes de UX según feedback del usuario

---

**Fecha de Implementación**: 9 de octubre de 2025
**Desarrollador**: GitHub Copilot
**Contexto**: Refactorización completa del sistema de apertura/cierre para usar arquitectura modular con stores Pinia
